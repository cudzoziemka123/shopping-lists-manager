import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { itemsApi } from '../api/items';
import { listsApi } from '../api/lists';
import { ItemCard } from '../components/ItemCard';
import { CreateItemModal } from '../components/CreateItemModal';
import { MembersModal } from '../components/MembersModal';
import type { Item, ItemStatus, ListMember } from '../types';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import './ItemsPage.css';

export const ItemsPage = () => {
  const { listId } = useParams<{ listId: string }>();
  const navigate = useNavigate();
  const { isConnected, joinList, leaveList, subscribeToItems } = useWebSocket();
  const { user } = useAuth();
  const { notify } = useNotification();

  const [items, setItems] = useState<Item[]>([]);
  const [listTitle, setListTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [members, setMembers] = useState<ListMember[]>([]);

  const loadItems = useCallback(async () => {
    if (!listId) return;

    try {
      setLoading(true);
      const [itemsData, listData] = await Promise.all([
        itemsApi.getAll(listId),
        listsApi.getById(listId),
      ]);
      setListTitle(listData.title);
      setMembers(listData.members || []);
      setItems(itemsData);
    } catch {
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  }, [listId]);

  // Подключение к комнате WebSocket
  useEffect(() => {
    if (listId && isConnected) {
      joinList(listId);
      return () => leaveList(listId);
    }
  }, [listId, isConnected, joinList, leaveList]);

  // Загрузка данных и подписка на события
  useEffect(() => {
    if (!listId) return;

    loadItems();

    const unsubscribe = subscribeToItems(listId, {
      onItemCreated: (item) => {
        notify(`Добавлен: ${item.name}`, 'info');
        setItems((prev) => {
          if (prev.find((i) => i.id === item.id)) {
            return prev;
          }
          return [...prev, item];
        });
      },
      onItemUpdated: (item) => {
        notify(`Обновлён: ${item.name}`, 'info');
        setItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));
      },
      onItemDeleted: (data) => {
        notify('Товар удалён', 'info');
        setItems((prev) => prev.filter((i) => i.id !== data.itemId));
      },
    });

    return () => unsubscribe();
  }, [listId, loadItems, subscribeToItems, notify]);

  const handleToggleStatus = async (item: Item) => {
    if (!listId) return;

    const newStatus: ItemStatus =
      item.status === 'pending' ? ('purchased' as ItemStatus) : ('pending' as ItemStatus);

    try {
      await itemsApi.update(listId, item.id, { status: newStatus });
    } catch {
      notify('Ошибка обновления статуса', 'error');
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!listId) return;
    if (!confirm('Удалить товар?')) return;

    try {
      await itemsApi.delete(listId, itemId);
    } catch {
      notify('Ошибка удаления товара', 'error');
    }
  };

  const handleItemCreated = () => {
    setShowCreateModal(false);
  };

  const handleMemberAdded = () => {
    setShowMembersModal(false);
    loadItems();
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
          ← 
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
          {pendingItems.length > 0 && (
            <div className="items-section">
              <h3 className="section-title">
                Купить: ({pendingItems.length})
              </h3>
              <div className="items-list">
                {pendingItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onToggleStatus={handleToggleStatus}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {purchasedItems.length > 0 && (
            <div className="items-section">
              <h3 className="section-title">
                Куплено ({purchasedItems.length})
              </h3>
              <div className="items-list">
                {purchasedItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onToggleStatus={handleToggleStatus}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {showCreateModal && listId && (
        <CreateItemModal
          listId={listId}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleItemCreated}
        />
      )}

      {showMembersModal && listId && (
        <MembersModal
          listId={listId}
          members={members}
          isOwner={members.some((m) => m.userId === user?.id && m.role === 'owner')}
          onClose={() => setShowMembersModal(false)}
          onMemberAdded={handleMemberAdded}
        />
      )}
    </div>
  );
};
