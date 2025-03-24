import { useEffect, useState } from "react";
import { createClient } from "@/supabase/client";

export function usePermissions() {
  const [canEdit, setCanEdit] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setCanEdit(false);
          setCanDelete(false);
          return;
        }

        // Buscar as permissões do usuário
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (userData?.role === 'admin') {
          setCanEdit(true);
          setCanDelete(true);
        } else if (userData?.role === 'editor') {
          setCanEdit(true);
          setCanDelete(false);
        } else {
          setCanEdit(false);
          setCanDelete(false);
        }

      } catch (error) {
        console.error('Erro ao verificar permissões:', error);
        setCanEdit(false);
        setCanDelete(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkPermissions();
  }, []);

  return { canEdit, canDelete, isLoading };
}
