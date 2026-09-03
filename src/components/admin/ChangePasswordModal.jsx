import { useState } from 'react'
import { Save, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { api } from '../../lib/api.js'
import Modal from './Modal.jsx'

const MIN_LENGTH = 8

const emptyForm = { currentPassword: '', newPassword: '', confirmPassword: '' }

// Kenar çubuğundan açılan şifre değiştirme penceresi. Mevcut şifre yeniden
// sorulur; yeni şifre iki kez yazdırılıp eşleşmesi tarayıcıda kontrol edilir,
// asıl doğrulama sunucuda (PUT /auth/password).
export default function ChangePasswordModal({ open, onClose }) {
  const [form, setForm] = useState(emptyForm)
  const [reveal, setReveal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  function close() {
    setForm(emptyForm)
    setReveal(false)
    setError('')
    setDone(false)
    onClose()
  }

  const mismatch = form.confirmPassword && form.newPassword !== form.confirmPassword
  const tooShort = form.newPassword && form.newPassword.length < MIN_LENGTH

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (tooShort) {
      setError(`Yeni şifre en az ${MIN_LENGTH} karakter olmalı.`)
      return
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('Yeni şifreler birbiriyle eşleşmiyor.')
      return
    }
    setSaving(true)
    try {
      await api.put('/auth/password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })
      setDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const inputType = reveal ? 'text' : 'password'

  return (
    <Modal
      open={open}
      title="Şifre Değiştir"
      onClose={close}
      footer={
        done ? (
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={close}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            >
              Tamam
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={close}
              className="text-sm text-gray-500 hover:text-gray-800 px-2"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              form="change-password-form"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Kaydediliyor…' : 'Şifreyi Güncelle'}
            </button>
          </div>
        )
      }
    >
      {done ? (
        <div className="flex items-start gap-3 text-sm text-gray-700">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <p>
            Şifreniz güncellendi. Bir sonraki girişte yeni şifrenizi kullanın; açık
            oturumunuz devam ediyor.
          </p>
        </div>
      ) : (
        <form id="change-password-form" onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <Field label="Mevcut Şifre">
            <input
              type={inputType}
              required
              autoComplete="current-password"
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              className="input"
            />
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Yeni Şifre">
              <input
                type={inputType}
                required
                minLength={MIN_LENGTH}
                autoComplete="new-password"
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                className="input"
              />
              <span className={`block text-xs mt-1 ${tooShort ? 'text-red-600' : 'text-gray-500'}`}>
                En az {MIN_LENGTH} karakter.
              </span>
            </Field>
            <Field label="Yeni Şifre (tekrar)">
              <input
                type={inputType}
                required
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className={`input ${mismatch ? 'border-red-400' : ''}`}
              />
              {mismatch && (
                <span className="block text-xs text-red-600 mt-1">Şifreler eşleşmiyor.</span>
              )}
            </Field>
          </div>

          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800"
          >
            {reveal ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {reveal ? 'Şifreleri gizle' : 'Şifreleri göster'}
          </button>
        </form>
      )}
    </Modal>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1.5">{label}</span>
      {children}
    </label>
  )
}
