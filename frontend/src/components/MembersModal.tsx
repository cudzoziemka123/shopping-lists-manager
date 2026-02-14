import { useState } from 'react';
import { listsApi } from '../api/lists';
import { useNotification } from '../contexts/NotificationContext';
import type { ListMember } from '../types';

interface MembersModalProps {
  listId: string;
  members: ListMember[];
  isOwner: boolean;
  onClose: () => void;
  onMemberAdded: () => void;
}

export const MembersModal = ({ listId, members, isOwner, onClose, onMemberAdded }: MembersModalProps) => {
  const [memberEmail, setMemberEmail] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const { notify } = useNotification();

  const handleRemoveMember = async (memberId: string) => {
    try {
      await listsApi.removeMember(listId, memberId);
      onMemberAdded();
      notify('Участник удалён', 'success');
    } catch {
      notify('Ошибка удаления участника', 'error');
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingMember(true);

    try {
      await listsApi.addMember(listId, memberEmail);
      setMemberEmail('');
      onMemberAdded();
      notify('Участник добавлен!', 'success');
    } catch {
      notify('Ошибка добавления участника', 'error');
    } finally {
      setAddingMember(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Участники списка</h3>
          <button onClick={onClose} className="modal-close">
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
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>
                        {member.username ?? 'Без имени'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                        {member.email ?? ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '12px',
                          color: member.role === 'owner' ? '#3b82f6' : '#6b7280',
                          fontWeight: 500,
                        }}
                      >
                        {member.role === 'owner' ? 'Владелец' : 'Участник'}
                      </span>
                      {isOwner && member.role !== 'owner' && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="btn-delete"
                          style={{ width: '24px', height: '24px', fontSize: '18px' }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isOwner ? (
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
                  onClick={onClose}
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
          ) : (
            <div className="modal-footer">
              <button onClick={onClose} className="btn btn-secondary">
                Закрыть
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
