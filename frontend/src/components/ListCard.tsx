import type { ShoppingList } from '../types';

interface ListCardProps {
  list: ShoppingList;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ListCard = ({ list, onOpen, onDelete }: ListCardProps) => {
  return (
    <div className="list-card">
      <div className="list-card-content" onClick={() => onOpen(list.id)}>
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
          onClick={() => onOpen(list.id)}
          className="btn btn-secondary btn-sm"
        >
          Открыть
        </button>
        <button
          onClick={() => onDelete(list.id)}
          className="btn btn-danger btn-sm"
        >
          Удалить
        </button>
      </div>
    </div>
  );
};
