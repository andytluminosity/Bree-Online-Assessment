'use client'

import { useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { mockNotifications, type Notification } from '@/lib/mock-data'
import {
  Bell,
  FileText,
  CheckCircle2,
  Banknote,
  Info,
  AlertTriangle,
  CheckCheck,
  Trash2,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'document_request':
      return <FileText className="h-5 w-5 text-warning-foreground" />
    case 'approval':
      return <CheckCircle2 className="h-5 w-5 text-success" />
    case 'disbursement':
      return <Banknote className="h-5 w-5 text-primary" />
    case 'info':
      return <Info className="h-5 w-5 text-primary" />
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-warning-foreground" />
    default:
      return <Bell className="h-5 w-5 text-muted-foreground" />
  }
}

const getNotificationBg = (type: Notification['type'], read: boolean) => {
  if (read) return 'bg-card'
  switch (type) {
    case 'document_request':
      return 'bg-warning/5 border-warning/20'
    case 'approval':
      return 'bg-success/5 border-success/20'
    case 'disbursement':
      return 'bg-primary/5 border-primary/20'
    case 'warning':
      return 'bg-warning/5 border-warning/20'
    default:
      return 'bg-primary/5 border-primary/20'
  }
}

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

function NotificationCard({
  notification,
  onMarkRead,
  onDelete,
}: {
  notification: Notification
  onMarkRead: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <div
      className={cn(
        'relative flex gap-4 p-4 rounded-xl border transition-all hover:shadow-sm',
        getNotificationBg(notification.type, notification.read)
      )}
    >
      {!notification.read && (
        <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary" />
      )}
      
      <div className="flex-shrink-0 mt-1">
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
          {getNotificationIcon(notification.type)}
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className={cn(
              'text-sm',
              notification.read ? 'text-foreground' : 'font-semibold text-foreground'
            )}>
              {notification.title}
            </h4>
            <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatRelativeTime(notification.timestamp)}
          </span>
        </div>
        
        <div className="flex items-center gap-3 mt-3">
          {notification.applicationId && (
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="h-8 gap-2">
                <ExternalLink className="h-3 w-3" />
                View Application
              </Button>
            </Link>
          )}
          {!notification.read && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-2 text-muted-foreground hover:text-foreground"
              onClick={() => onMarkRead(notification.id)}
            >
              <CheckCheck className="h-3 w-3" />
              Mark as read
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-2 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(notification.id)}
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [activeTab, setActiveTab] = useState('all')

  const unreadCount = notifications.filter((n) => !n.read).length

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'all') return true
    if (activeTab === 'unread') return !n.read
    return n.type === activeTab
  })

  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const handleClearAll = () => {
    setNotifications([])
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
              {unreadCount > 0 && (
                <Badge className="bg-primary text-primary-foreground">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              Stay updated on your loan applications and account activity
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </Button>
            <Button
              variant="outline"
              className="gap-2 text-destructive hover:text-destructive"
              onClick={handleClearAll}
              disabled={notifications.length === 0}
            >
              <Trash2 className="h-4 w-4" />
              Clear all
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{notifications.length}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{unreadCount}</p>
                  <p className="text-xs text-muted-foreground">Unread</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-warning-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {notifications.filter((n) => n.type === 'document_request').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {notifications.filter((n) => n.type === 'approval').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Approvals</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Banknote className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {notifications.filter((n) => n.type === 'disbursement').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Disbursements</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all" className="gap-2">
                  All
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                    {notifications.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="unread" className="gap-2">
                  Unread
                  {unreadCount > 0 && (
                    <Badge className="h-5 px-1.5 text-xs bg-primary text-primary-foreground">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="document_request">Documents</TabsTrigger>
                <TabsTrigger value="approval">Approvals</TabsTrigger>
                <TabsTrigger value="disbursement">Disbursements</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {filteredNotifications.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Bell className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No notifications</h3>
                <p className="text-muted-foreground">
                  {activeTab === 'all'
                    ? "You're all caught up! No notifications at the moment."
                    : `No ${activeTab.replace('_', ' ')} notifications.`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkRead={handleMarkRead}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>
              Manage how you receive notifications about your loan applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive notifications in your browser</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Get updates sent to your email</p>
                  </div>
                </div>
                <Badge className="bg-success/20 text-success">Enabled</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Info className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">SMS Alerts</p>
                    <p className="text-sm text-muted-foreground">Receive text messages for important updates</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
