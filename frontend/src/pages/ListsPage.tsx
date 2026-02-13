import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listsApi } from '../api/lists';
import type { ShoppingList } from '../types';
import './ListsPage.css';

export const ListsPage = () => {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const navigate = useNavigate();

  // Load lists on component mount
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const newList = await listsApi.create({ title, description });
      setLists([newList, ...lists]); // Add to the beginning
      setShowCreateModal(false);
      setTitle('');
      setDescription('');
    } catch {
      alert('Ошибка создания списка');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить список?')) return;

    try {
      await listsApi.delete(id);
      setLists(lists.filter((list) => list.id !== id));
    } catch {
      alert('Ошибка удаления списка');
    }
  };

  const handleOpenList = (id: string) => {
    navigate(`/lists/${id}/items`);
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
            <div key={list.id} className="list-card">
              <div
                className="list-card-content"
                onClick={() => handleOpenList(list.id)}
              >
                <h3 className="list-card-title">{list.title}</h3>
                {list.description && (
                  <p className="list-card-description">{list.description}</p>
                )}
                <div className="list-card-date">
                  {new Date(list.createdAt).toLocaleDateString('ru-RU')}
                </div>
              </div>
              <div className="list-card-actions">
                <button
                  onClick={() => handleOpenList(list.id)}
                  className="btn btn-secondary btn-sm"
                >
                  Открыть
                </button>
                <button
                  onClick={() => handleDelete(list.id)}
                  className="btn btn-danger btn-sm"
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal window for creating a list */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Создать список</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  Название
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input"
                  required
                  disabled={creating}
                  maxLength={100}
                />
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Описание (необязательно)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-input form-textarea"
                  disabled={creating}
                  maxLength={500}
                  rows={3}
                />
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
                  {creating ? 'Создание...' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};