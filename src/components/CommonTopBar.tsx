import React from 'react';
import { ArrowLeft, User } from 'lucide-react';
import { Role } from '../types';

interface AuthTopBarProps {
  onBackClick: () => void;
  onSwitchRoleClick: () => void;
  className?: string;
}

export const AuthTopBar: React.FC<AuthTopBarProps> = ({
  onBackClick,
  onSwitchRoleClick,
  className = ''
}) => {
  return (
    <div className={`w-full flex items-center justify-between px-4 py-2 ${className}`}>
      <button
        type="button"
        data-testid="top_bar_back_button"
        onClick={onBackClick}
        className="w-11 h-11 flex items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <button
        type="button"
        data-testid="switch_role_button"
        onClick={onSwitchRoleClick}
        className="px-3.5 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600 text-[11px] font-semibold hover:bg-slate-50 transition-colors shadow-xs"
      >
        Switch Role
      </button>
    </div>
  );
};

interface AppHeaderWithAvatarProps {
  onBackClick: () => void;
  role: Role;
  centerContent?: React.ReactNode;
  onAvatarClick?: () => void;
  className?: string;
  backTestId?: string;
  avatarTestId?: string;
}

export const AppHeaderWithAvatar: React.FC<AppHeaderWithAvatarProps> = ({
  onBackClick,
  role,
  centerContent,
  onAvatarClick,
  className = '',
  backTestId = 'app_header_back_button',
  avatarTestId = 'app_header_avatar_button'
}) => {
  const isTeacher = role === 'TEACHER';
  const avatarBg = isTeacher ? 'bg-[#D97728]' : 'bg-[#0F87AC]';

  return (
    <div className={`w-full flex items-center justify-between px-4 py-2 ${className}`}>
      <button
        type="button"
        data-testid={backTestId}
        onClick={onBackClick}
        className="w-11 h-11 flex items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {centerContent && <div>{centerContent}</div>}

      <button
        type="button"
        data-testid={avatarTestId}
        onClick={onAvatarClick}
        className={`w-9 h-9 rounded-full ${avatarBg} text-white flex items-center justify-center shadow-xs hover:opacity-90 transition-opacity`}
      >
        <User className="w-4 h-4" />
      </button>
    </div>
  );
};
