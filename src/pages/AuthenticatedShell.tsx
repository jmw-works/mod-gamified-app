
+import { useEffect, useRef, useState, useMemo } from 'react';
+import { useAuthenticator } from '@aws-amplify/ui-react';
+import { fetchUserAttributes } from 'aws-amplify/auth';
+
+import { Header as HeaderBar } from '../components/Header';
+import AnnouncementBanner from '../components/LevelUpBanner';
+import CampaignGallery from '../components/CampaignGallery';
+import CampaignCanvas from '../components/CampaignCanvas';
+import UserStatsPanel from '../components/UserStatsPanel';
+
+import { useUserProfile } from '../hooks/useUserProfile';
+import { useCampaigns } from '../hooks/useCampaigns';
+import { useHeaderHeight } from '../hooks/useHeaderHeight';
+import { calculateXPProgress } from '../utils/xp';
+
+export default function AuthenticatedShell() {
+  const { user, signOut, authStatus } = useAuthenticator((ctx) => [ctx.user, ctx.authStatus]);
+  const userId = user?.userId ?? '';
+
+  const [attrs, setAttrs] = useState<Record<string, string> | null>(null);
+  const [showBanner, setShowBanner] = useState(true);
+  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
+
+  useEffect(() => {
+    let mounted = true;
+    if (authStatus !== 'authenticated') return;
+    fetchUserAttributes()
+      .then((a) => mounted && setAttrs((a ?? {}) as Record<string, string>))
+      .catch(() => mounted && setAttrs(null));
+    return () => {
+      mounted = false;
+    };
+  }, [authStatus]);
+
+  const emailFromAttrs = attrs?.email ?? null;
+  const { profile } = useUserProfile(userId, emailFromAttrs);
+
+  const { campaigns, loading: campaignsLoading } = useCampaigns(userId);
+
+  const headerRef = useRef<HTMLDivElement>(null);
+  const headerHeight = useHeaderHeight(headerRef);
+  const spacing = 24;
+
+  const currentXP = profile?.experience ?? 0;
+  const maxXP = 100;
+  const percentage = calculateXPProgress(currentXP, maxXP);
+  const bountiesCompleted = 0;
+  const streakDays = 0;
+
+  const gridStyle = useMemo(
+    () => ({
+      display: 'grid',
+      gridTemplateAreas: `"header header header" "banner banner banner" "gallery canvas stats"`,
+      gridTemplateColumns: '1fr 2fr 1fr',
+      gridAutoRows: 'auto',
+      minHeight: '100vh',
+      gap: spacing,
+    }),
+    [spacing]
+  );
+
+  return (
+    <div style={gridStyle}>
+      <div style={{ gridArea: 'header' }}>
+        <HeaderBar
+          ref={headerRef}
+          signOut={signOut}
+          currentXP={currentXP}
+          maxXP={maxXP}
+          bountiesCompleted={bountiesCompleted}
+          streakDays={streakDays}
+        />
+      </div>
+
+      {showBanner && (
+        <div style={{ gridArea: 'banner' }}>
+          <AnnouncementBanner currentXP={currentXP} maxXP={maxXP} onDismiss={() => setShowBanner(false)} />
+        </div>
+      )}
+
+      <div style={{ gridArea: 'gallery' }}>
+        <CampaignGallery
+          campaigns={campaigns}
+          loading={campaignsLoading}
+          activeCampaignId={activeCampaignId}
+          onSelect={setActiveCampaignId}
+        />
+      </div>
+
+      <div style={{ gridArea: 'canvas' }}>
+        <CampaignCanvas campaignId={activeCampaignId} userId={userId} />
+      </div>
+
+      <div style={{ gridArea: 'stats' }}>
+        <UserStatsPanel
+          user={{
+            username: user?.username,
+            attributes: { name: profile?.displayName ?? '', email: emailFromAttrs ?? undefined },
+          }}
+          currentXP={currentXP}
+          maxXP={maxXP}
+          percentage={percentage}
+          headerHeight={headerHeight}
+          spacing={spacing}
+        />
+      </div>
+    </div>
+  );
+}

