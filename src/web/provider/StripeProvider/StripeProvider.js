import {
  useEffect,
  useState,
  useMemo,
} from 'react'

import { useStripeCustomerSearch } from '../../hooks'

import { createStripeApi } from '../createStripeApi'
import { StripeContext } from '../StripeContext'

export const StripeProvider = ({ children, customerQS = "" }) => {
  const [cart, setCart] = useState([])
  const [customer, setCustomer] = useState({})
  const { data, refetch } = useStripeCustomerSearch(customerQS)
  
  useEffect(() => {
    if (typeof data !== "undefined" && Object.hasOwn(data, "stripeCustomerSearch")) {
      setCustomer(data.stripeCustomerSearch)
    }
  }, [data])

  useEffect(() => {
    const { stripeCustomerSearch } = refetch(customerQS)
    setCustomer(stripeCustomerSearch)
  }, [customerQS])
  
  // onMount fetch cart items from local storage
  // onMount fetch customer details from local storage
  useEffect(() => {
    const serializedCart = window.localStorage.getItem('stripeCart')
    const serializedCustomer = window.localStorage.getItem('stripeCustomer')
    if (serializedCart) {
      setCart(JSON.parse(serializedCart))
      setCustomer(JSON.parse(serializedCustomer))
    }
  }, [])

  // sync with localStorage
  useEffect(() => {
    setTimeout(() => {
      window.localStorage.setItem('stripeCart', JSON.stringify(cart))
    })
  }, [cart])

  useEffect(() => {
     setTimeout(() => {
      window.localStorage.setItem('stripeCustomer', JSON.stringify(customer))
    })
  }, [customer])

  // Only create new api obj when cart changes
  const api = useMemo(() => createStripeApi(cart, setCart, customer), [cart])
  return (
    <StripeContext.Provider value={api}>
      {children}
    </StripeContext.Provider>
  )
}