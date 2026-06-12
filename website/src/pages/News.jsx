import { useEffect, useState } from 'react'
import { Calendar, Tag, Loader } from 'lucide-react'
import api from '../api/axios'

const tagColors = {
  Membership:  'bg-primary-100 text-primary-700',
  Investment:  'bg-earth-100 text-earth-700',
  Technology:  'bg-blue-100 text-blue-700',
  Governance:  'bg-purple-100 text-purple-700',
  General:     'bg-gray-100 text-gray-700',
  Agriculture: 'bg-green-100 text-green-700',
  Finance:     'bg-yellow-100 text-yellow-700',
}

const fallbackColor = 'bg-gray-100 text-gray-700'

const staticPosts = [
  {
    id: 'static-1',
    published_at: '2026-05-01',
    tag: 'Membership',
    title: 'Member Onboarding Process Formalised',
    excerpt: 'Sycamore has launched a structured 5-stage onboarding process ensuring every new member joins with a clear understanding of their obligations and benefits.',
  },
  {
    id: 'static-2',
    published_at: '2026-04-01',
    tag: 'Investment',
    title: 'First Farm Investment Pool Launched',
    excerpt: 'Our inaugural collective farm investment has been launched. Members will receive their proportional returns at the end of the agricultural season.',
  },
  {
    id: 'static-3',
    published_at: '2026-03-01',
    tag: 'Technology',
    title: 'Digital Account Management Now Live',
    excerpt: 'Members can now track their savings balance, view loan schedules, and receive contribution reminders via WhatsApp — powered by our new management system.',
  },
]

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-GB', { year: 'numeric', month: 'long' })
}

export default function News() {
  const [posts, setPosts] = useState(staticPosts)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/public/news')
      .then(res => {
        const fetched = res.data?.data || []
        setPosts(fetched.length > 0 ? fetched : staticPosts)
      })
      .catch(() => setPosts(staticPosts))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <section className="bg-primary-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl md:text-5xl font-display font-extrabold mb-5">News &amp; Updates</h1>
          <p className="text-lg text-primary-200">Stay informed on cooperative activities, investment updates, and community news.</p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          ) : (
            <div className="space-y-8">
              {posts.map(p => (
                <article key={p.id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tagColors[p.tag] || fallbackColor}`}>
                      <Tag className="w-3 h-3 inline mr-1" />{p.tag}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar className="w-3 h-3" /> {formatDate(p.published_at)}
                    </span>
                  </div>
                  <h2 className="text-xl font-display font-bold text-gray-900 mb-2">{p.title}</h2>
                  <p className="text-gray-600 leading-relaxed">{p.excerpt}</p>
                </article>
              ))}
            </div>
          )}
          <p className="text-center text-gray-400 text-sm mt-12">
            Follow us on WhatsApp for real-time news and updates.
          </p>
        </div>
      </section>
    </>
  )
}
