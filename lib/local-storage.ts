'use client'

import type { LoanApplication } from './mock-data'

const STORAGE_KEY = 'bree-loan-applications'

export const loanApplicationStorage = {
  // Get all applications from local storage
  getApplications(): LoanApplication[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error reading from local storage:', error)
      return []
    }
  },

  // Save a new application to local storage
  saveApplication(application: Omit<LoanApplication, 'id' | 'submittedAt' | 'updatedAt'>): LoanApplication {
    if (typeof window === 'undefined') {
      throw new Error('Cannot save application on server side')
    }

    try {
      const applications = this.getApplications()
      const newApplication: LoanApplication = {
        ...application,
        id: `LA-${new Date().getFullYear()}-${String(applications.length + 1).padStart(3, '0')}`,
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      applications.push(newApplication)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(applications))
      
      return newApplication
    } catch (error) {
      console.error('Error saving to local storage:', error)
      throw error
    }
  },

  // Update an existing application
  updateApplication(id: string, updates: Partial<LoanApplication>): LoanApplication | null {
    if (typeof window === 'undefined') {
      throw new Error('Cannot update application on server side')
    }

    try {
      const applications = this.getApplications()
      const index = applications.findIndex(app => app.id === id)
      
      if (index === -1) return null

      const updatedApplication = {
        ...applications[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      }

      applications[index] = updatedApplication
      localStorage.setItem(STORAGE_KEY, JSON.stringify(applications))
      
      return updatedApplication
    } catch (error) {
      console.error('Error updating application:', error)
      throw error
    }
  },

  // Delete an application
  deleteApplication(id: string): boolean {
    if (typeof window === 'undefined') {
      throw new Error('Cannot delete application on server side')
    }

    try {
      const applications = this.getApplications()
      const filteredApplications = applications.filter(app => app.id !== id)
      
      if (filteredApplications.length === applications.length) return false

      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredApplications))
      return true
    } catch (error) {
      console.error('Error deleting application:', error)
      throw error
    }
  },

  // Clear all applications
  clearApplications(): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing applications:', error)
    }
  },

  // Initialize with mock data if no applications exist
  initializeWithMockData(mockData: LoanApplication[]): void {
    if (typeof window === 'undefined') return
    
    try {
      const existing = this.getApplications()
      if (existing.length === 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockData))
        console.log('Local storage initialized with', mockData.length, 'mock applications')
      } else {
        console.log('Local storage already contains', existing.length, 'applications')
      }
    } catch (error) {
      console.error('Error initializing with mock data:', error)
    }
  },

  // Force reload mock data (overwrites existing data)
  reloadMockData(mockData: LoanApplication[]): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockData))
      console.log('Local storage reloaded with', mockData.length, 'mock applications')
    } catch (error) {
      console.error('Error reloading mock data:', error)
    }
  },

  // Add mock data to existing applications (doesn't overwrite)
  addMockData(mockData: LoanApplication[]): void {
    if (typeof window === 'undefined') return
    
    try {
      const existing = this.getApplications()
      const existingIds = new Set(existing.map(app => app.id))
      const newApplications = mockData.filter(app => !existingIds.has(app.id))
      
      if (newApplications.length > 0) {
        const updatedApplications = [...existing, ...newApplications]
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedApplications))
        console.log('Added', newApplications.length, 'new mock applications to local storage')
      } else {
        console.log('All mock applications already exist in local storage')
      }
    } catch (error) {
      console.error('Error adding mock data:', error)
    }
  }
}
