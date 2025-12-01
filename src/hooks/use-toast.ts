"use client"

// src/hooks/use-toast.ts
import * as React from "react"
import type {
  ToastActionElement,
  ToastProps,
} from "../components/ui/toast"

const TOAST_LIMIT = 3 // Allow up to 3 toasts visible at once
const TOAST_REMOVE_DELAY = 5000 // Auto-remove after 5 seconds

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

// Generates a unique ID for each toast
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

// Defines the possible actions that can be dispatched to the toast reducer
type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast> // Allows updating parts of a toast
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"] // Optional ID to dismiss a specific toast, otherwise dismiss all
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"] // Optional ID to remove a specific toast, otherwise remove all
    }

// Defines the shape of the toast state
interface State {
  toasts: ToasterToast[]
}

// Stores timeout IDs for automatic removal
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

// Schedules a toast for removal after a delay
const addToRemoveQueue = (toastId: string) => {
  // If a timeout already exists for this toast, do nothing
  if (toastTimeouts.has(toastId)) {
    return
  }

  // Set a timeout to dispatch the REMOVE_TOAST action
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId); // Remove the timeout ID from the map
    // Dispatch action to remove the toast from state
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  // Store the timeout ID
  toastTimeouts.set(toastId, timeout)
}

// The reducer function handles state updates based on dispatched actions
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    // Add a new toast to the beginning of the array, respecting the limit
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    // Update an existing toast by its ID
    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    // Mark toast(s) as not open and schedule for removal
    case "DISMISS_TOAST": {
      const { toastId } = action

      // Schedule the specific toast or all toasts for removal
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      // Update the state to mark the toast(s) as closed
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false, // Mark as not open
              }
            : t
        ),
      }
    }
    // Remove a specific toast or all toasts immediately
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        // Remove all toasts
        return {
          ...state,
          toasts: [],
        }
      }
      // Remove a specific toast by filtering
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
    default:
      return state;
  }
}

// Array to hold listener functions that will be called on state change
const listeners: Array<(state: State) => void> = []

// The single source of truth for the toast state
let memoryState: State = { toasts: [] }

// Dispatches an action to the reducer and notifies listeners
function dispatch(action: Action) {
  // console.log("Dispatching toast action:", action.type, action); // Optional logging
  memoryState = reducer(memoryState, action)
  // Call all registered listener functions with the new state
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

// The type for the toast function argument (omits 'id' as it's generated)
type Toast = Omit<ToasterToast, "id">

// Function to create and display a new toast
function toast({ ...props }: Toast) {
  const id = genId() // Generate a unique ID

  // Function to update this specific toast
  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })

  // Function to dismiss this specific toast
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  // Dispatch the action to add the new toast to the state
  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true, // Toasts start open
      // Callback for when the toast's open state changes (e.g., closed by user)
      onOpenChange: (open) => {
        if (!open) dismiss() // If closed manually, dismiss it
      },
    },
  })

  // Return methods to control the toast
  return {
    id: id,
    dismiss,
    update,
  }
}

// The custom hook to access toast state and actions
function useToast() {
  // Use React state to trigger re-renders when the memoryState changes
  const [state, setState] = React.useState<State>(memoryState)

  // Register and unregister the setState function as a listener
  React.useEffect(() => {
    listeners.push(setState); // Add listener on mount
    return () => {
      // Remove listener on unmount
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state]) // Re-run effect if state identity changes (shouldn't normally happen)

  // Return the current state and the toast/dismiss functions
  return {
    ...state, // Spread the current toasts array
    toast, // Function to create new toasts
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }), // Function to dismiss toasts
  }
}

export { useToast, toast }