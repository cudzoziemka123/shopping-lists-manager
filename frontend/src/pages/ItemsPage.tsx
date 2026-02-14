import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { itemsApi } from '../api/items';
import { listsApi } from '../api/lists';
import type { Item, ItemStatus, ItemPriority, ListMember } from '../types';
import { useWebSocket } from '../contexts/WebSocketContext'
import './ItemsPage.css';

export const ItemsPage = () => {
  const { listId } = useParams<{ listId: string; }>();
  const navigate = useNavigate();
  const { isConnected, joinList, leaveList, subscribeToItems } = useWebSocket();


  const [items, setItems] = useState<Item[]>([]);
  const [listTitle, setListTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  //Members
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [members, setMembers] = useState<ListMember[]>([]);


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
      const [itemsData, listData] = await Promise.all([itemsApi.getAll(listId), listsApi.getById(listId)]);
      setListTitle(listData.title); 
      setMembers(listData.members || []); // Устанавливаем участников
      setItems(itemsData);
    } catch  {
      setError('Ошибка загрузки данных');
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
        // TODO: Логи пока что, нужно сделать уведомления
        console.log('Item created:', item);
        setItems((prev) => {
          // Избегаем дубликатов
          if (prev.find((i) => i.id === item.id)) {
            return prev;
          }
          return [...prev, item];
        });
      },
      onItemUpdated: (item) => {
        console.log('Item updated:', item);
        setItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));
      },
      onItemDeleted: (data) => {
        console.log('Item deleted:', data.itemId);
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
    await itemsApi.update(listId, item.id, {
      status: newStatus,
    });
  } catch {
    alert('Ошибка обновления статуса');
  }
};

const handleAddMember = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!listId) return;

  setAddingMember(true);

  try {
    await listsApi.addMember(listId, memberEmail);
    
    // Перезагружаем список чтобы получить обновленных members
    await loadItems();
    
    setShowMembersModal(false);
    setMemberEmail('');
    alert('Участник добавлен!');
  } catch  {
    alert('Ошибка добавления участника');
  } finally {
    setAddingMember(false);
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', flex: 1 }}>
            {isConnected && (
          <span style={{ color: '#10b981', fontSize: '14px' }}>
            🟢 Online
          </span>
          )}
        </div>
        <button
          onClick={() => setShowMembersModal(true)}
          className="btn btn-secondary"
          style={{ marginRight: '10px' }}
        >
          👥 Участники ({members.length})
        </button>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          + Добавить товар
        </button>
      </div>
      <h2 className="items-title">{listTitle || 'Товары'}</h2>


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
      {/* Модальное окно участников */}
{showMembersModal && (
  <div
    className="modal-overlay"
    onClick={() => setShowMembersModal(false)}
  >
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h3>Участники списка</h3>
        <button
          onClick={() => setShowMembersModal(false)}
          className="modal-close"
        >
          ×
        </button>
      </div>

      <div style={{ padding: '24px' }}>
        {/* Список участников */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '14px', color: '#6b7280', marginBottom: '10px' }}>
            Текущие участники:
          </h4>
          {members.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>Нет участников</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {members.map((member) => (
                <div
                  key={member.id}
                  style={{
                    padding: '10px',
                    background: '#f9fafb',
                    borderRadius: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '14px' }}>
                    User ID: {member.userId}
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      color: member.role === 'owner' ? '#3b82f6' : '#6b7280',
                      fontWeight: 500,
                    }}
                  >
                    {member.role === 'owner' ? 'Владелец' : 'Участник'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Форма добавления */}
        <form onSubmit={handleAddMember}>
          <div className="form-group">
            <label htmlFor="memberEmail" className="form-label">
              Добавить участника по email
            </label>
            <input
              id="memberEmail"
              type="email"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              className="form-input"
              placeholder="user@example.com"
              required
              disabled={addingMember}
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={() => setShowMembersModal(false)}
              className="btn btn-secondary"
              disabled={addingMember}
            >
              Закрыть
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={addingMember}
            >
              {addingMember ? 'Добавление...' : 'Добавить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}
    </div>
  );
};