// import { loadStripe } from '@stripe/stripe-js'
import { useMutation } from '@redwoodjs/web'
import gql from 'graphql-tag'

export const useStripeCheckout = () => {
  // Create Session Mutation
  const [checkout] = useMutation(
    gql`
      mutation Checkout(
        $cart: [ProductInput!]!
        $successUrl: String
        $cancelUrl: String
        $customer: StripeCustomerInput
        $mode: String
      ) {
        checkout(cart: $cart, successUrl: $successUrl, cancelUrl: $cancelUrl, customer: $customer, mode: $mode) {
          id
          sessionUrl
        }
      }
    `
  )
 
  return async ({ cart, successUrl, cancelUrl, customer, mode}) => {
    const newCart = cart.map(item => ({ id: item.id, quantity: item.quantity }))

    // Determines checkout mode based on whether price "type" was passed to cart item or whther a "mode" was passed to checkout hook
    const determinedMode = (() => {
      if (typeof mode === "undefined") {
        const hasRecurring = cart.some((item) => Object.hasOwn(item, 'type') && item.type === 'recurring')
        return hasRecurring ? "subscription" : "payment"
      } else {
        return mode
      }
    })()
    
    // Build variable payload
    const payload = {
      variables: {
        cart: newCart,
        successUrl: successUrl,
        cancelUrl: cancelUrl,
        mode: determinedMode,
        ... ((typeof customer !== "undefined" && customer !== null) && {
          customer: {
            id: customer.id,
            name: customer.name,
            email: customer.email
          }   
        })
      }
    }

    // Create checkout session and return session id
    const {
      data: {
        checkout: {
          id,
          sessionUrl
        },
      },
    } = await checkout(payload)

    // Redirect to Stripe Checkout
    location.href = sessionUrl;
  } 
}