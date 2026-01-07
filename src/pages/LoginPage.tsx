import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { LogIn } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { useToast } from '@/components/toast/ToastProvider'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { api, clearAuthFromMemory } from '@/api/axios'

const loginSchema = z.object({
  username: z.string().min(1, 'Usuário é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      // Salvar credenciais primeiro
      await login(data.username, data.password)

      // Testar autenticação fazendo uma requisição simples
      await api.get('/api/categorias')

      // Se chegou aqui, a autenticação funcionou
      showToast('success', 'Login realizado com sucesso!')
      navigate('/dashboard')
    } catch (error: any) {
      // Limpar credenciais em caso de erro
      clearAuthFromMemory()

      console.error('Erro no login:', error)

      if (error.response?.status === 401) {
        showToast('error', 'Usuário ou senha inválidos')
      } else if (
        error.code === 'ERR_NETWORK' ||
        error.message?.includes('CORS') ||
        error.message?.includes('Access-Control-Allow-Origin') ||
        !error.response
      ) {
        showToast(
          'error',
          'Erro de conexão com o backend. Verifique:\n' +
            '1. Se o backend está rodando em http://localhost:8080\n' +
            '2. Se o CORS está configurado no backend\n' +
            '3. Se a variável VITE_API_BASE_URL está correta no arquivo .env'
        )
      } else {
        showToast('error', `Erro ao fazer login: ${error.message || 'Tente novamente'}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 relative">
      {/* Theme Toggle - Canto Superior Direito */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[420px]"
      >
        {/* Card com glassmorphism */}
        <div className="bg-white/90 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/60 dark:border-slate-700/50 p-10 relative overflow-hidden">
          {/* Decoração de fundo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-purple-500/5 dark:from-blue-400/20 dark:to-purple-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-red-500/5 to-pink-500/5 dark:from-red-400/15 dark:to-pink-400/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            {/* Logo e Título */}
            <div className="text-center mb-10">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center justify-center mb-6"
              >
                <img
                  src="/DSP_Marca_130716-01.png"
                  alt="Drogaria SP Logo"
                  className="h-12 w-auto object-contain"
                />
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2"
              >
                Bem-vindo
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-sm text-slate-600 dark:text-slate-400"
              >
                Entre com suas credenciais para continuar
              </motion.p>
            </div>

            {/* Form */}
            <motion.form 
              onSubmit={handleSubmit(onSubmit)} 
              className="space-y-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Input
                label="Usuário"
                type="text"
                placeholder="Digite seu usuário"
                {...register('username')}
                error={errors.username?.message}
                autoComplete="username"
              />

              <Input
                label="Senha"
                type="password"
                placeholder="Digite sua senha"
                {...register('password')}
                error={errors.password?.message}
                autoComplete="current-password"
              />

              <motion.div 
                className="pt-2"
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200" 
                  isLoading={isLoading}
                >
                  {!isLoading && <LogIn className="w-5 h-5 mr-2 stroke-[1.75]" />}
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </Button>
              </motion.div>
            </motion.form>
          </div>
        </div>
        
        {/* Rodapé */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="text-center text-sm text-slate-600 dark:text-slate-500 mt-6"
        >
          Sistema de Gestão Farmacêutica
        </motion.p>
      </motion.div>
    </div>
  )
}
