import React from "react"
import { ViewStyle } from "react-native"
import { Slot, SplashScreen } from "expo-router"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { useInitialRootStore } from "src/models"

SplashScreen.preventAutoHideAsync()

if (__DEV__) {
  // Load Reactotron configuration in development. We don't want to
  // include this in our production bundle, so we are using `if (__DEV__)`
  // to only execute this in development.
  require("src/devtools/ReactotronConfig.ts")
}

export { ErrorBoundary } from "src/components/ErrorBoundary/ErrorBoundary"

export default function Root() {
  // Wait for stores to load and render our layout inside of it so we have access
  // to auth info etc
  const { rehydrated } = useInitialRootStore()
  if (!rehydrated) {
    return null
  }

  return (
    <GestureHandlerRootView style={$root}>
      <Slot />
    </GestureHandlerRootView>
  )
}

const $root: ViewStyle = { flex: 1 }
