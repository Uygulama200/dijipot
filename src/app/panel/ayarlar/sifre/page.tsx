const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  // Validation
  if (formData.newPassword !== formData.confirmPassword) {
    toast.error('Yeni şifreler eşleşmiyor')
    return
  }

  if (formData.newPassword.length < 6) {
    toast.error('Yeni şifre en az 6 karakter olmalıdır')
    return
  }

  if (formData.newPassword === formData.currentPassword) {
    toast.error('Yeni şifre eski şifrenizden farklı olmalıdır')
    return
  }

  setLoading(true)

  try {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user?.email) {
      toast.error('Oturum bulunamadı. Lütfen tekrar giriş yapın.')
      router.push('/giris')
      return
    }

    // Verify current password
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: session.user.email,
      password: formData.currentPassword,
    })

    if (verifyError) {
      toast.error('Mevcut şifre yanlış')
      setLoading(false)
      return
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: formData.newPassword
    })

    if (updateError) {
      if (updateError.message.includes('should be different')) {
        toast.error('Yeni şifre eski şifrenizden farklı olmalıdır')
      } else {
        toast.error('Şifre güncellenemedi: ' + updateError.message)
      }
      setLoading(false)
      return
    }

    toast.success('Şifreniz başarıyla güncellendi!')
    
    // Clear form
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    })

    // Redirect after 2 seconds
    setTimeout(() => {
      router.push('/panel')
    }, 2000)
  } catch (error) {
    console.error('Password change error:', error)
    toast.error('Bir hata oluştu')
  } finally {
    setLoading(false)
  }
}
