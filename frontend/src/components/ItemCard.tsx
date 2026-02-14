import type { Item, ItemPriority } from '../types';

interface ItemCardProps {
  item: Item;
  onToggleStatus: (item: Item) => void;
  onDelete: (itemId: string) => void;
}

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

export const ItemCard = ({ item, onToggleStatus, onDelete }: ItemCardProps) => {
  const isPurchased = item.status === 'purchased';

  return (
    <div className={`item-card${isPurchased ? ' item-purchased' : ''}`}>
      <div className="item-checkbox">
        <input
          type="checkbox"
          checked={isPurchased}
          onChange={() => onToggleStatus(item)}
          className="checkbox"
        />
      </div>
      <div className="item-content">
        <div className="item-name">{item.name}</div>
        <div className="item-details">
          <span className="item-quantity">
            {item.quantity} {item.unit || 'шт'}
          </span>
          {!isPurchased && (
            <span
              className="item-priority"
              style={{ color: getPriorityColor(item.priority) }}
            >
              {getPriorityLabel(item.priority)}
            </span>
          )}
        </div>
      </div>
      <button
        onClick={() => onDelete(item.id)}
        className="btn-delete"
      >
        ×
      </button>
    </div>
  );
};
