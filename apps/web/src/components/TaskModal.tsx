'use client'

import { useState, useEffect, useRef } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (taskData: any) => void
  task?: any
  mode: 'create' | 'edit'
}

export default function TaskModal({ isOpen, onClose, onSave, task, mode }: TaskModalProps) {
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState('todo')
  const [priority, setPriority] = useState('med')
  const [assigneeEmail, setAssigneeEmail] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState('')

  const modalRef = useRef<HTMLDivElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (task && mode === 'edit') {
      setTitle(task.title || '')
      setStatus(task.status || 'todo')
      setPriority(task.priority || 'med')
      setAssigneeEmail(task.assigneeEmail || '')
      setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '')
    } else {
      setTitle('')
      setStatus('todo')
      setPriority('med')
      setAssigneeEmail('')
      setDueDate('')
    }
    setError('')
  }, [task, mode, isOpen])

  useEffect(() => {
    if (isOpen && titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [isOpen])

  // Focus trap implementation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }

      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        
        if (focusableElements && focusableElements.length > 0) {
          const firstElement = focusableElements[0] as HTMLElement
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault()
              lastElement.focus()
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault()
              firstElement.focus()
            }
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Client-side validation - correctly blocks empty title
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    // DEFECT 10: Client-side date validation bug - accepts invalid dates
    // This should validate date format but doesn't
    if (dueDate && !dueDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // This validation is too weak and allows invalid dates like 2025-13-40
    }

    const taskData = {
      title: title.trim(),
      status,
      priority,
      assigneeEmail: assigneeEmail || undefined,
      dueDate: dueDate || undefined,
    }

    onSave(taskData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full"
        role="dialog"
        // DEFECT 9: Accessibility gap - missing aria-labelledby
        // Should have: aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 
            id="modal-title" 
            className="text-lg font-medium text-gray-900 dark:text-white"
          >
            {mode === 'create' ? 'Create New Task' : 'Edit Task'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title *
            </label>
            <input
              ref={titleInputRef}
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter task title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="med">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="assigneeEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Assignee Email
            </label>
            <input
              id="assigneeEmail"
              type="email"
              value={assigneeEmail}
              onChange={(e) => setAssigneeEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="admin@test.io or tester@test.io"
            />
          </div>

          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Due Date
            </label>
            <input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {mode === 'create' ? 'Create Task' : 'Update Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
