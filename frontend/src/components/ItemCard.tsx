import type { Item, ItemPriority, ListMember } from '../types';

interface ItemCardProps {
  item: Item;
  members: ListMember[];
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

const formatPurchasedAt = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const ItemCard = ({ item, members, onToggleStatus, onDelete }: ItemCardProps) => {
  const isPurchased = item.status === 'purchased';
  const purchasedByMember = members.find((m) => m.userId === item.purchasedById);
  const purchasedByUsername = purchasedByMember?.username ?? purchasedByMember?.email ?? null;

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
          {isPurchased && (purchasedByUsername || item.purchasedAt) && (
            <span className="item-purchased-info">
              {purchasedByUsername && <>👤 {purchasedByUsername}</>}
              {purchasedByUsername && item.purchasedAt && ' · '}
              {item.purchasedAt && <>📅 {formatPurchasedAt(item.purchasedAt)}</>}
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
