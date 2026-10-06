import { useCallback, useEffect, useMemo, useState } from 'react'
import { getProducts, addProduct, updateProduct, deleteProduct, errorMessage } from '../api.js'
import ProductForm from '../components/ProductForm.jsx'
import Logo from '../components/Logo.jsx'

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })

export default function Products({ user, onLogout }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [query, setQuery] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null) // product being edited, or null for "add"
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setProducts(await getProducts())
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 2800)
    return () => clearTimeout(t)
  }, [toast])

  const openAdd = () => { setEditing(null); setFormError(''); setFormOpen(true) }
  const openEdit = (p) => { setEditing(p); setFormError(''); setFormOpen(true) }
  const closeForm = useCallback(() => setFormOpen(false), [])

  const save = async (payload) => {
    setSaving(true)
    setFormError('')
    try {
      if (editing) await updateProduct(editing.id, payload)
      else await addProduct(payload)
      setFormOpen(false)
      setToast(editing ? 'Product updated' : 'Product added')
      await load()
    } catch (err) {
      setFormError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await deleteProduct(toDelete.id)
      setToDelete(null)
      setToast('Product deleted')
      await load()
    } catch (err) {
      setToDelete(null)
      setError(errorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) => p.product_name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q)
    )
  }, [products, query])

  const stats = useMemo(() => ({
    count: products.length,
    units: products.reduce((s, p) => s + p.quantity, 0),
    value: products.reduce((s, p) => s + p.price * p.quantity, 0),
  }), [products])

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand"><Logo /> <span>Product Management</span></div>
        <div className="who">
          <span className="avatar" aria-hidden="true">{user?.username?.[0]?.toUpperCase() || '?'}</span>
          <span className="who-name">{user?.username}</span>
          <button className="btn ghost sm" onClick={onLogout}>Log out</button>
        </div>
      </header>

      <main className="content">
        <section className="stats" aria-label="Summary">
          <div className="stat"><span>Products</span><strong>{stats.count}</strong></div>
          <div className="stat"><span>Units in stock</span><strong>{stats.units.toLocaleString()}</strong></div>
          <div className="stat"><span>Inventory value</span><strong>{peso.format(stats.value)}</strong></div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h1>Products</h1>
            <div className="tools">
              <input
                className="search"
                type="search"
                placeholder="Search products…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search products"
              />
              <button className="btn primary" onClick={openAdd}>+ Add product</button>
            </div>
          </div>

          {error && <div className="alert err" role="alert">{error} <button className="link" onClick={load}>Retry</button></div>}

          {loading ? (
            <p className="empty">Loading products…</p>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <p>{products.length === 0 ? 'No products yet.' : 'No products match your search.'}</p>
              {products.length === 0 && <button className="btn primary" onClick={openAdd}>Add your first product</button>}
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Product</th>
                    <th className="num">Price</th>
                    <th className="num">Qty</th>
                    <th>Created</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id}>
                      <td data-label="ID" className="muted">#{p.id}</td>
                      <td data-label="Product">
                        <div className="pcell">
                          <div className="pname">{p.product_name}</div>
                          {p.description && <div className="pdesc">{p.description}</div>}
                        </div>
                      </td>
                      <td data-label="Price" className="num">{peso.format(p.price)}</td>
                      <td data-label="Qty" className="num">
                        <span className={`pill ${p.quantity === 0 ? 'out' : p.quantity < 5 ? 'low' : ''}`}>{p.quantity}</span>
                      </td>
                      <td data-label="Created" className="muted">{p.created_at?.slice(0, 10)}</td>
                      <td className="row-actions">
                        <button className="btn ghost sm" onClick={() => openEdit(p)}>Edit</button>
                        <button className="btn danger sm" onClick={() => setToDelete(p)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {formOpen && (
        <ProductForm product={editing} onSave={save} onCancel={closeForm} busy={saving} error={formError} />
      )}

      {toDelete && (
        <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && setToDelete(null)}>
          <div className="modal small" role="alertdialog" aria-modal="true" aria-labelledby="del-title">
            <h2 id="del-title">Delete product?</h2>
            <p className="muted">
              <strong>{toDelete.product_name}</strong> will be permanently removed. This cannot be undone.
            </p>
            <div className="actions">
              <button className="btn ghost" onClick={() => setToDelete(null)}>Cancel</button>
              <button className="btn danger solid" onClick={confirmDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  )
}
