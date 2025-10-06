'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/hooks/api'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Button, Input, Modal } from '@/components/ui'
import Link from 'next/link'
import Image from 'next/image'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit3,
  Save,
  X,
  Camera,
  Settings,
  Package,
  TrendingUp,
  Star,
  Clock,
  Eye,
  ArrowLeft,
  Badge,
  Calendar,
  Globe,
  Heart,
  MessageCircle,
  Award,
  Truck,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { NavHeader } from '@/components/shared'
import { Footer } from '@/components/navigation'
import { PhoneVerification } from '@/components/verification/PhoneVerification'
import moment from 'moment'

const AuthGuard = dynamic(
  () => import('@/components/auth').then(mod => ({ default: mod.AuthGuard })),
  { ssr: false }
)

// User stats interface based on Prisma schema
interface UserStats {
  totalPackagesSent: number
  totalTripsCompleted: number
  senderRating: number
  travelerRating: number
  successRate: number
  totalDeliveries: number
  memberSince: string
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED'
  totalReviews: number
  responseTime: string
}

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  status: string;
  amount: string | null;
  createdAt: string;
}

// Profile Header Component with real user data
function ProfileHeader({ user, isOwnProfile, isEditing, setIsEditing, stats, onSave }: any) {
  const getVerificationBadge = () => {
    switch (stats?.verificationStatus) {
      case 'VERIFIED':
        return (
          <div className="flex items-center space-x-1 bg-green-100 text-green-700 p-1 rounded-full text-xs">
            <CheckCircle className="size-6" />
            {/* <span>Verified</span> */}
          </div>
        )
      case 'PENDING':
        return (
          <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-700 p-1 rounded-full text-xs size-6">
            <Clock className="size-6" />
            {/* <span>Pending</span> */}
          </div>
        )
      case 'REJECTED':
        return (
          <div className="flex items-center space-x-1 bg-red-100 text-red-700 p-1 rounded-full text-xs">
            <AlertCircle className="size-6" />
            <span>Verification Required</span>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-xl p-8 mb-8 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black bg-opacity-20 rounded-xl"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 transform skew-x-12"></div>

      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
          {/* Profile Picture */}
          <div className="relative">
            <div className="w-28 h-28 lg:w-36 lg:h-36 bg-neutral-500 bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm border-4 border-white border-opacity-30">
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt="Profile"
                  width={144}
                  height={144}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-16 h-16 lg:w-20 lg:h-20 text-white" />
              )}
            </div>
            {isOwnProfile && (
              <button className="absolute bottom-2 right-2 w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-opacity-30 transition-colors">
                <Camera className="w-5 h-5 text-teal-600" />
              </button>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl lg:text-4xl font-bold">
                {user?.firstName} {user?.otherName} {user?.lastName}
              </h1>
              {getVerificationBadge()}
            </div>

            <p className="text-white text-opacity-90 mb-2 text-lg">
              @{user?.username || 'username'}
            </p>

            {user?.profile?.bio && (
              <p className="text-white text-opacity-80 mb-4 max-w-2xl">
                {user.profile.bio}
              </p>
            )}

            {/* Enhanced Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4" />
                <span>{stats?.totalPackagesSent || 0} Packages</span>
              </div>
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4" />
                <span>{stats?.totalTripsCompleted || 0} Trips</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4" />
                <span>{stats?.senderRating || 0}/5 Rating</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Since {stats?.memberSince || '2024'}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {isOwnProfile && (
              <Link href="/account/settings">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
            )}
            {isOwnProfile ? (
              !isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-teal-400 bg-opacity-20 hover:bg-opacity-30 text-white border-white border-opacity-30"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    onClick={onSave}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )
            ) : (
              <div className="flex space-x-2">
                <Button className="bg-white !text-teal-800 bg-opacity-20 hover:bg-opacity-30 hover:!text-white border-white border-opacity-30">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </Button>
                <Button className="bg-white !text-teal-800 bg-opacity-20 hover:bg-opacity-30 hover:!text-white border-white border-opacity-30">
                  <Heart className="w-4 h-4 mr-2" />
                  Follow
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Enhanced Profile Information Component
function ProfileInformation({ user, isOwnProfile, isEditing, editData, handleInputChange, onSave, setIsEditing }: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
        {!isOwnProfile && (
          <div className="flex items-center text-sm text-gray-500">
            <Eye className="w-4 h-4 mr-1" />
            Public Profile
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">Personal Details</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">User Name</label>
            {isEditing && isOwnProfile ? (
              <Input
                value={editData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Enter user name"
              />
            ) : (
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{user?.username || 'Not provided'}</span>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            {isEditing && isOwnProfile ? (
              <Input
                value={editData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Enter first name"
              />
            ) : (
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{user?.firstName || 'Not provided'}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            {isEditing && isOwnProfile ? (
              <Input
                value={editData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Enter last name"
              />
            ) : (
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{user?.lastName || 'Not provided'}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Other Names</label>
            {isEditing && isOwnProfile ? (
              <Input
                value={editData.otherName}
                onChange={(e) => handleInputChange('otherName', e.target.value)}
                placeholder="Enter other names"
              />
            ) : (
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{user?.otherName || 'Not provided'}</span>
              </div>
            )}
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            {isEditing && isOwnProfile ? (
              <Input
                type="email"
                disabled
                value={editData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
              />
            ) : (
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{user?.email || 'Not provided'}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            {isEditing && isOwnProfile ? (
              <Input
                type="tel"
                value={editData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter phone number"
              />
            ) : (
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{user?.phone || 'Not provided'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Professional Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">Professional Info</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
            {isEditing && isOwnProfile ? (
              <Input
                type='date'
                value={moment(editData.dateOfBirth).format('YYYY-MM-DD')}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                placeholder="Enter your date of birth"
              />
            ) : (
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{moment(user?.dateOfBirth).format('dddd, DD [of] MMMM, YYYY') || 'Not provided'}</span>
              </div>
            )}  
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
            {isEditing && isOwnProfile ? (
              <Input
                value={editData.occupation}
                onChange={(e) => handleInputChange('occupation', e.target.value)}
                placeholder="Enter your occupation"
              />
            ) : (
              <div className="flex items-center space-x-2">
                <Badge className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{user?.profile?.occupation || 'Not provided'}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            {isEditing && isOwnProfile ? (
              <div className="space-y-2">
                <Input
                  value={editData.currentCity}
                  onChange={(e) => handleInputChange('currentCity', e.target.value)}
                  placeholder="City"
                />
                <Input
                  value={editData.currentCountry}
                  onChange={(e) => handleInputChange('currentCountry', e.target.value)}
                  placeholder="Country"
                />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">
                  {user?.profile?.currentCity && user?.profile?.currentCountry
                    ? `${user.profile.currentCity}, ${user.profile.currentCountry}`
                    : 'Not provided'}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
            {isEditing && isOwnProfile ? (
              <Input
                value={editData.languages.join(', ')}
                onChange={(e) => handleInputChange(
                  'languages',
                  e.target.value.split(', ').filter(lang => lang.trim() !== '')
                )}
                placeholder="English, Spanish, French..."
              />
            ) : (
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">
                  {user?.profile?.languages?.length > 0
                    ? user.profile.languages.join(', ')
                    : 'Not provided'}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">About Me</label>
            {isEditing && isOwnProfile ? (
              <textarea
                value={editData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell us about yourself..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent resize-none"
              />
            ) : (
              <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                {user?.profile?.bio || 'No bio provided yet.'}
              </p>
            )}
          </div>
        </div>
      </div>
      {isEditing && isOwnProfile && (
        <div className="flex space-x-2 my-4 w-full justify-end">
          <Button
            onClick={onSave}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button
            onClick={() => setIsEditing(false)}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      )}

    </div>
  )
}

// Enhanced Activity Stats with real data
function ActivityStats({ stats }: { stats: UserStats }) {
  const statItems = [
    {
      title: 'Packages Sent',
      value: stats.totalPackagesSent || 0,
      color: 'bg-blue-500',
      icon: Package,
      description: 'Total packages created'
    },
    {
      title: 'Trips Completed',
      value: stats.totalTripsCompleted || 0,
      color: 'bg-green-500',
      icon: Truck,
      description: 'Successful deliveries'
    },
    {
      title: 'Success Rate',
      value: `${stats.successRate || 0}%`,
      color: 'bg-purple-500',
      icon: TrendingUp,
      description: 'Delivery success rate'
    },
    {
      title: 'Total Rating',
      value: `${stats.senderRating || 0}/5`,
      color: 'bg-yellow-500',
      icon: Star,
      description: `${stats.totalReviews || 0} reviews`
    }
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Activity Overview</h2>
        <div className="flex items-center text-sm text-gray-500">
          <Award className="w-4 h-4 mr-1" />
          <span>Performance metrics</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {statItems.map((stat, index) => (
          <div key={index} className="text-center">
            <div className={`${stat.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 hover:scale-105 transition-transform`}>
              <stat.icon className="w-8 h-8 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
            <p className="text-sm font-medium text-gray-700 mb-1">{stat.title}</p>
            <p className="text-xs text-gray-500">{stat.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Recent Activity with real data structure
function RecentActivity({ activities, isLoading }: { activities: Activity[], isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
        <Link href="/account/activity">
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            View All
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 space-y-4">
        {activities && activities.length > 0 ? (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`w-2 h-2 rounded-full mt-2 ${activity.status === 'completed' || activity.status === 'delivered' ? 'bg-green-500' : 'bg-blue-500'
                }`}></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  {activity.amount && (
                    <span className="text-sm font-medium text-green-600">{activity.amount}</span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{activity.description}</p>
                <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No recent activity found.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { getCurrentUser } = useAuth()
  const { data: currentUser } = getCurrentUser
  const params = useParams()

  const [isEditing, setIsEditing] = useState(false)
  const [profileUser, setProfileUser] = useState<any>(null)
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    otherName: '',
    username: '',
    email: '',
    phone: '',
    bio: '',
    dateOfBirth: '',
    occupation: '',
    currentCity: '',
    currentCountry: '',
    languages: []
  })
  const [userStats, setUserStats] = useState<UserStats>({
    totalPackagesSent: 0,
    totalTripsCompleted: 0,
    senderRating: 0,
    travelerRating: 0,
    successRate: 0,
    totalDeliveries: 0,
    memberSince: '2024',
    verificationStatus: 'PENDING',
    totalReviews: 0,
    responseTime: '< 1 hour'
  })
  const [activities, setActivities] = useState<Activity[]>([])
  const [isActivityLoading, setIsActivityLoading] = useState(true)
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false)

  // Determine if viewing own profile or another user's profile
  const userId = params?.id
  const isOwnProfile = !userId || userId === currentUser?.id

  const handleInputChange = (field: string, value: any) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!profileUser) return

    const phoneChanged = editData.phone !== profileUser.phone

    console.log(phoneChanged, 'Profile user:', profileUser.phone, "Edited phone", editData.phone)

    console.log('Saving profile with data:', editData)

    setIsVerifyingPhone(phoneChanged)

    try {
      const response = await fetch(`/api/users/${profileUser.id}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editData)
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setProfileUser(updatedUser)
        setIsEditing(false)
        // TODO: Show success toast

        if (phoneChanged) {
          // Trigger phone verification flow
          await fetch('/api/auth/send-phone-verification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: editData.phone })
          })
          setIsVerifyingPhone(true)
        }
      } else {
        // TODO: Show error toast
        console.error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const fetchUserStats = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/stats`)
      if (response.ok) {
        const stats = await response.json()
        setUserStats(stats)
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error)
    }
  }, [])

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/profile`)
      if (response.ok) {
        const profile = await response.json()
        setProfileUser(profile)
        setEditData({
          firstName: profile?.firstName || '',
          lastName: profile?.lastName || '',
          otherName: profile?.otherName || '',
          username: profile?.username || '',
          dateOfBirth: profile?.dateOfBirth || '',
          email: profile?.email || '',
          phone: profile?.phone || '',
          bio: profile?.profile?.bio || '',
          occupation: profile?.profile?.occupation || '',
          currentCity: profile?.profile?.currentCity || '',
          currentCountry: profile?.profile?.currentCountry || '',
          languages: profile?.profile?.languages || [],
        })
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
    }
  }, [])

  const fetchUserActivity = useCallback(async (userId: string) => {
    setIsActivityLoading(true)
    try {
      const response = await fetch(`/api/users/${userId}/activity`)
      if (response.ok) {
        const data = await response.json()
        setActivities(data)
      }
    } catch (error) {
      console.error('Failed to fetch user activity:', error)
    } finally {
      setIsActivityLoading(false)
    }
  }, [])

  useEffect(() => {
    const loadUserData = async (id: string) => {
      await Promise.all([
        fetchUserStats(id),
        fetchUserActivity(id)
      ]);
    }

    if (isOwnProfile && currentUser) {
      setProfileUser(currentUser)
      loadUserData(currentUser.id)
      setEditData({
        firstName: currentUser?.firstName || '',
        lastName: currentUser?.lastName || '',
        otherName: currentUser?.otherName || '',
        username: currentUser?.username || '',
        email: currentUser?.email || '',
        dateOfBirth: currentUser?.dateOfBirth || '',
        phone: currentUser?.phone || '',
        bio: currentUser?.profile?.bio || '',
        occupation: currentUser?.profile?.occupation || '',
        currentCity: currentUser?.profile?.currentCity || '',
        currentCountry: currentUser?.profile?.currentCountry || '',
        languages: currentUser?.profile?.languages || [],
      })
    } else if (userId && typeof userId === 'string') {
      fetchUserProfile(userId)
      loadUserData(userId)
    }
  }, [currentUser, userId, isOwnProfile, fetchUserStats, fetchUserProfile, fetchUserActivity])

  if (!profileUser) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <NavHeader title='Amenade' email={profileUser?.email} name={`${profileUser?.firstName} ${profileUser?.lastName}`} showMenuItems={true} />
        {/* Header */}
        {/*  <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Link href="/" className="text-blue-600 hover:text-blue-700 flex items-center">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
                <span className="text-gray-300">|</span>
                <h1 className="text-xl font-semibold text-gray-900">
                  {isOwnProfile ? 'My Profile' : `${profileUser.firstName}&apos;s Profile`}
                </h1>
              </div>
              
              {isOwnProfile && (
                <Link href="/account/settings">
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </header> */}

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0 py-8">
          <ProfileHeader
            user={profileUser}
            isOwnProfile={isOwnProfile}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            stats={userStats}
            onSave={handleSave}
          />

          <ProfileInformation
            user={profileUser}
            isOwnProfile={isOwnProfile}
            isEditing={isEditing}
            editData={editData}
            handleInputChange={handleInputChange}
            onSave={handleSave}
            setIsEditing={setIsEditing}
          />

          <ActivityStats stats={userStats} />

          <RecentActivity activities={activities} isLoading={isActivityLoading} />

          {isVerifyingPhone && (
            <Modal
              isOpen={true}
              onClose={() => setIsVerifyingPhone(false)}
              title="Phone Verification"
              size="lg"
            >
              <PhoneVerification onClose={() => setIsVerifyingPhone(false)} />
            </Modal>
          )}
        </main>
        <Footer />
      </div>
    </AuthGuard>
  )
}
