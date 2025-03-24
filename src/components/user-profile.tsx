'use client'
import { UserCircle } from 'lucide-react'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { createClient } from '../../supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function UserProfile() {
    const supabase = createClient()
    const router = useRouter()
    const [userName, setUserName] = useState<string>('')

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                // Busca o nome completo do usuário na tabela users
                const { data: userData } = await supabase
                    .from('users')
                    .select('full_name')
                    .eq('id', user.id)
                    .single()

                if (userData?.full_name) {
                    setUserName(userData.full_name)
                    return
                }

                // Se não encontrar na tabela users, mostra "Usuário"
                setUserName('Usuário')
            }
        }
        getUser()
    }, [])

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">
                Bem-vindo, {userName}
            </span>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <UserCircle className="h-6 w-6" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={async () => {
                        await supabase.auth.signOut()
                        router.refresh()
                    }}>
                        Sair
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}