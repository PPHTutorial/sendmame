'use client'

import { useState } from 'react'
import { Button, Input, Card, Badge } from '@/components/ui'
import Image from 'next/image'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Edit3, 
  Save, 
  X, 
  Camera,
  Star,
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  Settings
} from 'lucide-react'

interface UserAccountProps {
  user: any
  isOwnProfile: boolean
  onEdit?: () => void
}

// User Avatar Component
function UserAvatar({ user, isOwnProfile, size = 'large' }: any) {
  const sizeClasses: Record<string, string> = {
    small: 'w-10 h-10',
    medium: 'w-16 h-16',
    large: 'w-24 h-24'
  }

  const iconSizes: Record<string, string> = {
    small: 'w-5 h-5',
    medium: 'w-8 h-8', 
    large: 'w-12 h-12'
  }

  return (
    <div className="relative">
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white`}>
        {user?.avatar ? (
          <Image 
            src={user.avatar} 
            alt={`${user.firstName} ${user.lastName}`}
            width={96}
            height={96}
            className={`${sizeClasses[size]} rounded-full object-cover`}
          />
        ) : (
          <User className={iconSizes[size]} />
        )}
      </div>
      {isOwnProfile && size === 'large' && (
        <button className="absolute bottom-0 right-0 w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors border-2 border-white">
          <Camera className="w-4 h-4 text-gray-600" />
        </button>
      )}
    </div>
  )
}

// User Stats Component
function UserStats({ user }: any) {
  const stats = [
    {
      icon: Package,
      label: 'Packages',
      value: user?.stats?.packages || '0',
      color: 'text-blue-600'
    },
    {
      icon: TrendingUp,
      label: 'Trips',
      value: user?.stats?.trips || '0',
      color: 'text-green-600'
    },
    {
      icon: Star,
      label: 'Rating',
      value: user?.stats?.rating || '0.0',
      color: 'text-yellow-600'
    },
    {
      icon: CheckCircle,
      label: 'Success Rate',
      value: user?.stats?.successRate || '0%',
      color: 'text-purple-600'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 mb-2`}>
            <stat.icon className={`w-6 h-6 ${stat.color}`} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          <p className="text-sm text-gray-600">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}

// User Verification Status Component
function VerificationStatus({ user }: any) {
  const verifications = [
    {
      type: 'Email',
      verified: user?.verifications?.email || false,
      icon: Mail
    },
    {
      type: 'Phone',
      verified: user?.verifications?.phone || false,
      icon: Phone
    },
    {
      type: 'Identity',
      verified: user?.verifications?.identity || false,
      icon: Shield
    }
  ]

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-900">Verification Status</h4>
      {verifications.map((verification, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <verification.icon className="w-5 h-5 text-gray-600" />
            <span className="text-gray-900">{verification.type}</span>
          </div>
          <Badge
            variant={verification.verified ? 'success' : 'default'}
            className={verification.verified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
          >
            {verification.verified ? 'Verified' : 'Pending'}
          </Badge>
        </div>
      ))}
    </div>
  )
}

// Profile Information Form Component
function ProfileForm({ user, isEditing, onSave, onCancel }: any) {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || ''
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = () => {
    onSave(formData)
  }

  const fields = [
    { key: 'firstName', label: 'First Name', type: 'text', icon: User },
    { key: 'lastName', label: 'Last Name', type: 'text', icon: User },
    { key: 'email', label: 'Email', type: 'email', icon: Mail },
    { key: 'phone', label: 'Phone', type: 'tel', icon: Phone },
    { key: 'location', label: 'Location', type: 'text', icon: MapPin }
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
            </label>
            {isEditing ? (
              <Input
                type={field.type}
                value={formData[field.key as keyof typeof formData]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={`Enter ${field.label.toLowerCase()}`}
              />
            ) : (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <field.icon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900">
                  {user?.[field.key] || 'Not provided'}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bio Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          About Me
        </label>
        {isEditing ? (
          <textarea
            value={formData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            placeholder="Tell us about yourself..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent resize-none"
          />
        ) : (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-900 whitespace-pre-wrap">
              {user?.bio || 'No bio provided yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex space-x-3">
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      )}
    </div>
  )
}

// Main User Account Component
export function UserAccount({ user, isOwnProfile, onEdit }: UserAccountProps) {
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = (formData: any) => {
    // In a real app, you'd call an API to update the user data
    console.log('Saving user data:', formData)
    setIsEditing(false)
    if (onEdit) onEdit()
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const memberSince = user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear()

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-6">
          <UserAvatar user={user} isOwnProfile={isOwnProfile} />
          
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h1>
              {user?.verifications?.identity && (
                <Badge variant="info" className="bg-blue-100 text-blue-800">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            
            <p className="text-gray-600 mb-2">@{user?.username || 'username'}</p>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Member since {memberSince}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Last active 2 hours ago</span>
              </div>
            </div>
          </div>

          {isOwnProfile && !isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>

        <UserStats user={user} />
      </Card>

      {/* Profile Information Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
          {!isOwnProfile && (
            <Badge variant="default" className="bg-gray-100 text-gray-600">
              Read Only
            </Badge>
          )}
        </div>

        <ProfileForm
          user={user}
          isEditing={isEditing}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </Card>

      {/* Verification & Security Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <VerificationStatus user={user} />
        </Card>
        
        {isOwnProfile && (
          <Card className="p-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Account Security</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Two-Factor Authentication</span>
                  <Badge variant={user?.security?.twoFactor ? 'success' : 'default'}>
                    {user?.security?.twoFactor ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Password Strength</span>
                  <Badge variant="info">Strong</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Active Sessions</span>
                  <span className="text-sm text-gray-600">2 devices</span>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                Security Settings
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

export default UserAccount
