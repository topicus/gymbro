import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { useChapters } from '@/hooks/useChapters'
import { useCheckIns } from '@/hooks/useCheckIns'
import { Auth } from '@/pages/Auth'
import { Profile } from '@/pages/Profile'
import { Dashboard } from '@/pages/Dashboard'
import { Chapters } from '@/pages/Chapters'
import { CheckIn } from '@/pages/CheckIn'
import { AiChat } from '@/components/AiChat'

function AppContent() {
  const { user, loading: authLoading, signIn, signUp, signOut, resetPassword, signInWithMagicLink, signInWithGoogle, isMockMode } = useAuth()
  const { profile, loading: profileLoading, saveProfile, hasProfile } = useProfile(user?.id)
  const {
    chapters,
    activeChapter,
    addChapter,
    updateChapter,
    deleteChapter,
    setChapterStatus,
    preloadDefaultChapters,
    getChapterProgress,
  } = useChapters(user?.id)
  const {
    checkIns,
    addCheckIn,
    getTodayCheckIn,
    getLastCheckIn,
    hasCheckedInToday,
    getRecentCheckIns,
  } = useCheckIns(user?.id)

  // Loading state
  if (authLoading || (user && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!user) {
    return <Auth onSignIn={signIn} onSignUp={signUp} onResetPassword={resetPassword} onMagicLink={signInWithMagicLink} onGoogle={signInWithGoogle} isMockMode={isMockMode} />
  }

  // No profile yet - onboarding
  if (!hasProfile) {
    return (
      <Profile
        profile={null}
        onSave={saveProfile}
        onPreloadChapters={preloadDefaultChapters}
        isNewUser={true}
      />
    )
  }

  const chapterProgress = activeChapter ? getChapterProgress(activeChapter) : 0

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <Dashboard
              profile={profile!}
              activeChapter={activeChapter}
              recentCheckIns={getRecentCheckIns(5)}
              hasCheckedInToday={hasCheckedInToday()}
              chapterProgress={chapterProgress}
              onSignOut={signOut}
            />
          }
        />
        <Route
          path="/profile"
          element={
            <Profile
              profile={profile}
              onSave={saveProfile}
              onPreloadChapters={preloadDefaultChapters}
              isNewUser={false}
            />
          }
        />
        <Route
          path="/chapters"
          element={
            <Chapters
              chapters={chapters}
              onAdd={addChapter}
              onUpdate={updateChapter}
              onDelete={deleteChapter}
              onStatusChange={setChapterStatus}
              getProgress={getChapterProgress}
            />
          }
        />
        <Route
          path="/check-in"
          element={
            <CheckIn
              todayCheckIn={getTodayCheckIn()}
              lastCheckIn={getLastCheckIn()}
              onSubmit={addCheckIn}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* AI Chat - available on all pages */}
      <AiChat
        profile={profile}
        activeChapter={activeChapter}
        recentCheckIns={checkIns}
      />
    </>
  )
}

export default function App() {
  return <AppContent />
}
