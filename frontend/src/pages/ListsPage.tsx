import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listsApi } from '../api/lists';
import { ListCard } from '../components/ListCard';
import { CreateListModal } from '../components/CreateListModal';
import { useNotification } from '../contexts/NotificationContext';
import type { ShoppingList } from '../types';
import './ListsPage.css';

export const ListsPage = () => {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const navigate = useNavigate();
  const { notify } = useNotification();

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    try {
      setLoading(true);
      const data = await listsApi.getAll();
      setLists(data);
    } catch {
      setError('Ошибка загрузки списков');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить список?')) return;

    try {
      await listsApi.delete(id);
      setLists(lists.filter((list) => list.id !== id));
    } catch {
      notify('Ошибка удаления списка', 'error');
    }
  };

  const handleOpenList = (id: string) => {
    navigate(`/lists/${id}/items`);
  };

  const handleListCreated = (newList: ShoppingList) => {
    setLists([newList, ...lists]);
    setShowCreateModal(false);
  };

  if (loading) {
    return (
      <div className="lists-page">
        <div className="loading">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="lists-page">
      <div className="lists-header">
        <h2 className="lists-title">Мои списки покупок</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          + Создать список
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {lists.length === 0 ? (
        <div className="empty-state">
          <p>У вас пока нет списков покупок</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            Создать первый список
          </button>
        </div>
      ) : (
        <div className="lists-grid">
          {lists.map((list) => (
            <ListCard
              key={list.id}
              list={list}
              onOpen={handleOpenList}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateListModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleListCreated}
        />
      )}
    </div>
  );
};
