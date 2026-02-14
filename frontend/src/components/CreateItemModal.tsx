import { useState } from 'react';
import { itemsApi } from '../api/items';
import { useNotification } from '../contexts/NotificationContext';
import type { ItemPriority } from '../types';

interface CreateItemModalProps {
  listId: string;
  onClose: () => void;
  onCreated: () => void;
}

export const CreateItemModal = ({ listId, onClose, onCreated }: CreateItemModalProps) => {
  const { notify } = useNotification();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('');
  const [priority, setPriority] = useState<ItemPriority>('medium' as ItemPriority);
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      await itemsApi.create(listId, {
        name,
        quantity: parseFloat(quantity),
        unit: unit || undefined,
        priority,
      });
      onCreated();
    } catch {
      notify('Ошибка создания товара', 'error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Добавить товар</h3>
          <button onClick={onClose} className="modal-close">
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
              {creating ? 'Добавление...' : 'Добавить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
