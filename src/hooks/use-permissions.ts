import { useEffect, useState } from 'react';
import { createClient } from '@/supabase/client';

export type UserRole = 'admin' | 'editor' | 'viewer';

export function usePermissions() {
  const [userRole, setUserRole] = useState<UserRole>('viewer');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setUserRole('viewer');
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setUserRole(data?.role || 'viewer');
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      setUserRole('viewer');
    } finally {
      setIsLoading(false);
    }
  };

  const canCreate = userRole === 'admin' || userRole === 'editor';
  const canEdit = userRole === 'admin' || userRole === 'editor';
  const canDelete = userRole === 'admin';

  return {
    userRole,
    isLoading,
    canCreate,
    canEdit,
    canDelete,
    isAdmin: userRole === 'admin',
  };
} 