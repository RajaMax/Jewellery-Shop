import { createContext, useContext, useEffect, useReducer } from 'react';

const CartContext = createContext();

const STORAGE_KEY = 'cart';

function loadInitial() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const existing = state.find((i) => i._id === action.product._id);
      if (existing) {
        return state.map((i) =>
          i._id === action.product._id
            ? { ...i, quantity: Math.min(i.quantity + 1, action.product.stock) }
            : i
        );
      }
      return [...state, { ...action.product, quantity: 1 }];
    }
    case 'SET_QTY':
      return state.map((i) =>
        i._id === action.id
          ? { ...i, quantity: Math.max(1, Math.min(action.quantity, i.stock)) }
          : i
      );
    case 'REMOVE':
      return state.filter((i) => i._id !== action.id);
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, undefined, loadInitial);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = {
    items,
    addToCart: (product) => dispatch({ type: 'ADD', product }),
    setQuantity: (id, quantity) => dispatch({ type: 'SET_QTY', id, quantity }),
    removeFromCart: (id) => dispatch({ type: 'REMOVE', id }),
    clearCart: () => dispatch({ type: 'CLEAR' }),
    count: items.reduce((n, i) => n + i.quantity, 0),
    total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
