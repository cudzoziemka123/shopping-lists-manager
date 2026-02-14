import { useState } from 'react';
import { listsApi } from '../api/lists';
import { useNotification } from '../contexts/NotificationContext';
import type { ShoppingList } from '../types';

interface CreateListModalProps {
  onClose: () => void;
  onCreated: (list: ShoppingList) => void;
}

export const CreateListModal = ({ onClose, onCreated }: CreateListModalProps) => {
  const { notify } = useNotification();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const newList = await listsApi.create({ title, description });
      onCreated(newList);
    } catch {
      notify('Ошибка создания списка', 'error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Создать список</h3>
          <button onClick={onClose} className="modal-close">
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
              onClick={onClose}
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
  );
};
