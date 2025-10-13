// Demo data for exploring the site before backend is ready

export const getDemoPosts = () => [
    {
      id: '1',
      userId: 'demo_1',
      author: {
        id: 'demo_1',
        username: 'GamerPro',
        displayName: 'Elite Gamer',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GamerPro',
        badges: [{ name: 'Verified', icon: 'check' }]
      },
      content: 'Just finished my new Roblox simulator! Check out the epic gameplay and let me know what you think. #RobloxDev #Gaming',
      media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop' }],
      likes: 342,
      comments: 45,
      shares: 12,
      isLiked: false,
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '2',
      userId: 'demo_2',
      author: {
        id: 'demo_2',
        username: 'DevQueen',
        displayName: 'Code Queen',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DevQueen',
        badges: [{ name: 'Pro Dev', icon: 'code' }]
      },
      content: 'New tutorial series coming soon! Learn how to create advanced Roblox simulators from scratch. Who\'s excited?',
      media: [],
      likes: 567,
      comments: 89,
      shares: 34,
      isLiked: false,
      createdAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: '3',
      userId: 'demo_3',
      author: {
        id: 'demo_3',
        username: 'BuilderBob',
        displayName: 'Bob the Builder',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BuilderBob',
        badges: []
      },
      content: 'Movie Night tonight at 8 PM! We\'re watching some epic gaming documentaries. Join us in the Movie Night section!',
      media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=800&h=600&fit=crop' }],
      likes: 198,
      comments: 23,
      shares: 8,
      isLiked: false,
      createdAt: new Date(Date.now() - 10800000).toISOString()
    }
  ];
  
  export const getDemoGames = () => [
    {
      id: '1',
      title: 'Epic Pet Simulator',
      description: 'Collect and upgrade hundreds of unique pets in this action-packed simulator!',
      thumbnail: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&h=400&fit=crop',
      screenshots: ['https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&h=600&fit=crop'],
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      playUrl: 'https://www.roblox.com/games/12345',
      genre: 'Simulator',
      players: 12500,
      rating: 4.8,
      featured: true,
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: '2',
      title: 'Combat Arena Legends',
      description: 'Fight your way to the top in this intense PvP battle arena!',
      thumbnail: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=600&h=400&fit=crop',
      screenshots: ['https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&h=600&fit=crop'],
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      playUrl: 'https://www.roblox.com/games/67890',
      genre: 'PvP',
      players: 8900,
      rating: 4.6,
      featured: true,
      createdAt: new Date(Date.now() - 172800000).toISOString()
    }
  ];
  
  export const getDemoMovieNights = () => [
    {
      id: '1',
      title: 'Gaming Legends Documentary Marathon',
      description: 'Join us for an evening of inspiring gaming documentaries',
      hostId: 'demo_1',
      host: {
        id: 'demo_1',
        username: 'GamerPro',
        displayName: 'Elite Gamer',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GamerPro'
      },
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      thumbnail: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=800&h=600&fit=crop',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      participants: 45,
      maxParticipants: 100,
      isLive: false
    }
  ];
  
  export const getDemoAIAvatars = () => [
    {
      id: 'betty',
      name: 'Betty',
      fullName: 'Betty White',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=betty',
      personality: 'Wise and encouraging mentor',
      specialty: 'Game design & storytelling',
      status: 'online'
    },
    {
      id: 'robin',
      name: 'Robin',
      fullName: 'Robin Williams',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=robin',
      personality: 'Energetic and creative',
      specialty: 'Comedy & character development',
      status: 'online'
    },
    {
      id: 'johnny',
      name: 'Johnny',
      fullName: 'Johnny Hardwick',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=johnny',
      personality: 'Technical and detail-oriented',
      specialty: 'Programming & debugging',
      status: 'away'
    },
    {
      id: 'jonathan',
      name: 'Jonathan',
      fullName: 'Jonathan Joss',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=jonathan',
      personality: 'Strategic and analytical',
      specialty: 'Game balancing & monetization',
      status: 'online'
    }
  ];
  
  export const getDemoFriends = () => [
    {
      id: 'demo_2',
      username: 'DevQueen',
      displayName: 'Code Queen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DevQueen',
      status: 'online',
      level: 38
    },
    {
      id: 'demo_3',
      username: 'BuilderBob',
      displayName: 'Bob the Builder',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BuilderBob',
      status: 'online',
      level: 29
    }
  ];
  
  export const getDemoTrending = () => [
    { tag: 'RobloxDev', posts: '2.5K' },
    { tag: 'PetSimulator', posts: '1.8K' },
    { tag: 'BuildBattle', posts: '1.2K' },
    { tag: 'MovieNight', posts: '890' },
    { tag: 'DevTutorial', posts: '654' }
  ];
  
  export const getDemoNotifications = () => [
    {
      id: '1',
      type: 'like',
      userId: 'demo_2',
      user: {
        username: 'DevQueen',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DevQueen'
      },
      message: 'liked your post',
      isRead: false,
      createdAt: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: '2',
      type: 'comment',
      userId: 'demo_3',
      user: {
        username: 'BuilderBob',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BuilderBob'
      },
      message: 'commented on your post',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ];
  