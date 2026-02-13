import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { itemsApi } from '../api/items';
import type { Item, ItemStatus, ItemPriority } from '../types';
import { useWebSocket } from '../contexts/WebSocketContext'
import './ItemsPage.css';

export const ItemsPage = () => {
  const { listId } = useParams<{ listId: string; }>();
  const navigate = useNavigate();
  const { isConnected, joinList, leaveList, subscribeToItems } = useWebSocket();


  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal window for creating items
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('');
  const [priority, setPriority] = useState<ItemPriority>('medium' as ItemPriority);
  const [creating, setCreating] = useState(false);

  const loadItems = useCallback(async () => {
    if (!listId) return;

    try {
      setLoading(true);
      const data = await itemsApi.getAll(listId);
      setItems(data);
    } catch {
      setError('Ошибка загрузки товаров');
    } finally {
      setLoading(false);
    }
  }, [listId]);

useEffect(() => {
  if (listId) {
    loadItems();

    // Присоединяемся к комнате
    if (isConnected) {
      joinList(listId);
    }

    // Подписываемся на события
    const unsubscribe = subscribeToItems(listId, {
      onItemCreated: (item) => {
        console.log('🆕 Item created:', item);
        setItems((prev) => {
          // Избегаем дубликатов
          if (prev.find((i) => i.id === item.id)) {
            return prev;
          }
          return [...prev, item];
        });
      },
      onItemUpdated: (item) => {
        console.log('📝 Item updated:', item);
        setItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));
      },
      onItemDeleted: (data) => {
        console.log('🗑️ Item deleted:', data.itemId);
        setItems((prev) => prev.filter((i) => i.id !== data.itemId));
      },
    });

    // Cleanup
    return () => {
      if (isConnected) {
        leaveList(listId);
      }
      unsubscribe();
    };
  }
}, [listId, isConnected, loadItems, joinList, leaveList, subscribeToItems]);

  const handleCreate = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!listId) return;

  setCreating(true);

  try {
    await itemsApi.create(listId, {  // ← Просто await, без присваивания
      name,
      quantity: parseFloat(quantity),
      unit: unit || undefined,
      priority,
    });
    // WebSocket добавит товар автоматически через subscribeToItems
    setShowCreateModal(false);
    setName('');
    setQuantity('1');
    setUnit('');
    setPriority('medium' as ItemPriority);
  } catch {
    alert('Ошибка создания товара');
  } finally {
    setCreating(false);
  }
};

const handleToggleStatus = async (item: Item) => {
  if (!listId) return;

  const newStatus: ItemStatus =
    item.status === 'pending' ? ('purchased' as ItemStatus) : ('pending' as ItemStatus);

  try {
    await itemsApi.update(listId, item.id, {  // ← Просто await, без присваивания
      status: newStatus,
    });
    // WebSocket обновит автоматически через subscribeToItems
  } catch {
    alert('Ошибка обновления статуса');
  }
};

  const handleDelete = async (itemId: string) => {
    if (!listId) return;
    if (!confirm('Удалить товар?')) return;

    try {
      await itemsApi.delete(listId, itemId);
      // setItems(items.filter((item) => item.id !== itemId)); // то же самое
    } catch  {
      alert('Ошибка удаления товара');
    }
  };

  const getPriorityColor = (priority: ItemPriority) => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getPriorityLabel = (priority: ItemPriority) => {
    switch (priority) {
      case 'high':
        return 'Высокий';
      case 'medium':
        return 'Средний';
      case 'low':
        return 'Низкий';
      default:
        return priority;
    }
  };

  if (loading) {
    return (
      <div className="items-page">
        <div className="loading">Загрузка...</div>
      </div>
    );
  }

  const pendingItems = items.filter((item) => item.status === 'pending');
  const purchasedItems = items.filter((item) => item.status === 'purchased');

  return (
    <div className="items-page">
      <div className="items-header">
        <button onClick={() => navigate('/lists')} className="btn-back">
          ← Назад к спискам
        </button>
        <h2 className="items-title">Товары</h2>
        {isConnected && (
          <span style={{ color: '#10b981', fontSize: '14px', marginLeft: '10px' }}>
            🟢 Online
          </span>
        )}
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          + Добавить товар
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {items.length === 0 ? (
        <div className="empty-state">
          <p>В списке пока нет товаров</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            Добавить первый товар
          </button>
        </div>
      ) : (
        <>
          {/* Товары к покупке */}
          {pendingItems.length > 0 && (
            <div className="items-section">
              <h3 className="section-title">
                Купить: ({pendingItems.length})
              </h3>
              <div className="items-list">
                {pendingItems.map((item) => (
                  <div key={item.id} className="item-card">
                    <div className="item-checkbox">
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={() => handleToggleStatus(item)}
                        className="checkbox"
                      />
                    </div>
                    <div className="item-content">
                      <div className="item-name">{item.name}</div>
                      <div className="item-details">
                        <span className="item-quantity">
                          {item.quantity} {item.unit || 'шт'}
                        </span>
                        <span
                          className="item-priority"
                          style={{ color: getPriorityColor(item.priority) }}
                        >
                          {getPriorityLabel(item.priority)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="btn-delete"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Купленные товары */}
          {purchasedItems.length > 0 && (
            <div className="items-section">
              <h3 className="section-title">
                Куплено ({purchasedItems.length})
              </h3>
              <div className="items-list">
                {purchasedItems.map((item) => (
                  <div key={item.id} className="item-card item-purchased">
                    <div className="item-checkbox">
                      <input
                        type="checkbox"
                        checked={true}
                        onChange={() => handleToggleStatus(item)}
                        className="checkbox"
                      />
                    </div>
                    <div className="item-content">
                      <div className="item-name">{item.name}</div>
                      <div className="item-details">
                        <span className="item-quantity">
                          {item.quantity} {item.unit || 'шт'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="btn-delete"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Модальное окно создания товара */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateModal(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Добавить товар</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Название
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  required
                  disabled={creating}
                  maxLength={100}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="quantity" className="form-label">
                    Количество
                  </label>
                  <input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="form-input"
                    required
                    disabled={creating}
                    min="0.01"
                    step="0.01"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="unit" className="form-label">
                    Единица
                  </label>
                  <input
                    id="unit"
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="form-input"
                    disabled={creating}
                    placeholder="кг, л, шт"
                    maxLength={20}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="priority" className="form-label">
                  Приоритет
                </label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as ItemPriority)}
                  className="form-input"
                  disabled={creating}
                >
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                </select>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                  disabled={creating}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={creating}
                >
                  {creating ? 'Добавление...' : 'Добавить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};