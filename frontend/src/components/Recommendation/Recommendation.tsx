import { useState, useEffect } from 'react'

type User = {
  id: string
  name: string
  username: string
  gender: string
  country: string
  favorites: string
}

const API_ADDRESS = 'http://localhost:9999/api'

const Recommendation = ({ user }: { user: User }) => {
  const [recommendations, setRecommendations] = useState<{ data: any[] }>({
    data: [],
  })

  useEffect(() => {
    fetch(`${API_ADDRESS}/user/similar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ favorites: user.favorites }),
    })
      .then((res) => res.json())
      .then((data) => {
        setRecommendations(data)
      })
  }, [user.id, user.favorites])

  console.log(recommendations)

  return (
    <>
      <div>
        <h2>Recommendations for {user.name}</h2>
        <p>Based on your favorites, we recommend the following movies:</p>
        <div>
          {recommendations?.data?.map((recommendation) => (
            <div key={recommendation._source.title}>
              {recommendation._source.title}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default Recommendation
