import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';

const roles = [
  {
    value: 'customer',
    title: 'Customer',
    description: 'Browse plants and request orders.'
  },
  {
    value: 'owner',
    title: 'Nursery Owner',
    description: 'Manage your nursery profile and plants.'
  }
];

export function RegisterPage({ onRegister, registering }) {
  const [role, setRole] = useState('customer');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [nurseryName, setNurseryName] = useState('');
  const [nurseryAddress, setNurseryAddress] = useState('');
  const [documents, setDocuments] = useState([{ doc_type: '', file: null }]);

  return (
    <section className="container-wide py-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
        <div className="rounded-[36px] bg-leaf-forest px-6 py-10 text-white shadow-card sm:px-8">
          <p className="text-sm uppercase tracking-[0.26em] text-white/65">
            Join LocalLeaf
          </p>
          <h1 className="mt-4 font-display text-5xl leading-tight">
            Create your account.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/78">
            Register as a customer or a nursery owner. Owners add nursery details
            during signup.
          </p>
        </div>

        <div className="glass-panel p-6 sm:p-8">
          <h2 className="font-display text-3xl text-leaf-forest">Register</h2>
          <p className="mt-2 text-sm leading-6 text-leaf-moss">
            Already have an account?{' '}
            <Link className="font-semibold text-leaf-forest underline" to="/login">
              Login
            </Link>
            .
          </p>

          <div className="mt-6 grid gap-4">
            {roles.map((item) => (
              <button
                key={item.value}
                type="button"
                className={`rounded-[24px] border p-5 text-left transition ${
                  role === item.value
                    ? 'border-leaf-forest bg-leaf-sage/40'
                    : 'border-leaf-moss/15 bg-white hover:border-leaf-moss/40'
                }`}
                onClick={() => setRole(item.value)}
              >
                <p className="font-semibold text-leaf-forest">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-leaf-moss">
                  {item.description}
                </p>
              </button>
            ))}
          </div>

          <form
            className="mt-6 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              onRegister({
                role,
                name,
                phone,
                password,
                nursery_name: role === 'owner' ? nurseryName : undefined,
                nursery_address: role === 'owner' ? nurseryAddress : undefined,
                documents:
                  role === 'owner'
                    ? documents
                        .filter((doc) => doc.doc_type && doc.file)
                        .map((doc) => ({
                          doc_type: doc.doc_type,
                          file: doc.file
                        }))
                    : []
              });
            }}
          >
            <input
              required
              className="field-input"
              placeholder="Full name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <input
              required
              className="field-input"
              placeholder="Phone number"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
            <input
              required
              className="field-input"
              placeholder="Password (min 6 chars)"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            {role === 'owner' && (
              <>
                <input
                  required
                  className="field-input"
                  placeholder="Nursery name"
                  value={nurseryName}
                  onChange={(event) => setNurseryName(event.target.value)}
                />
                <textarea
                  required
                  className="field-input min-h-28 resize-none"
                  placeholder="Nursery address"
                  value={nurseryAddress}
                  onChange={(event) => setNurseryAddress(event.target.value)}
                />

                <div className="rounded-[24px] bg-white/70 p-5">
                  <p className="text-sm font-semibold text-leaf-forest">
                    Upload documents (optional)
                  </p>
                  <p className="mt-2 text-sm text-leaf-moss">
                    Add document type and file. You can also upload later from the dashboard.
                  </p>

                  <div className="mt-4 space-y-3">
                    {documents.map((doc, index) => (
                      <div key={index} className="rounded-[20px] bg-white/70 p-4">
                        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
                          <input
                            className="field-input"
                            placeholder="Document type (e.g. GST, License)"
                            value={doc.doc_type}
                            onChange={(e) =>
                              setDocuments((current) =>
                                current.map((item, i) =>
                                  i === index
                                    ? { ...item, doc_type: e.target.value }
                                    : item
                                )
                              )
                            }
                          />
                          <input
                            className="field-input"
                            type="file"
                            onChange={(e) =>
                              setDocuments((current) =>
                                current.map((item, i) =>
                                  i === index
                                    ? { ...item, file: e.target.files?.[0] || null }
                                    : item
                                )
                              )
                            }
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            className="border-rose-200 text-rose-700 hover:bg-rose-50"
                            onClick={() =>
                              setDocuments((current) =>
                                current.filter((_, i) => i !== index)
                              )
                            }
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}

                    <div className="flex flex-wrap gap-3">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() =>
                          setDocuments((current) => [...current, { doc_type: '', file: null }])
                        }
                      >
                        Add another
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}

            <Button className="w-full" disabled={registering} type="submit">
              {registering ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
