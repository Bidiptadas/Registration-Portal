# UI flow - User Journeys

## Student Journey

```
[ HomePage ] 
    │
    ├─► [ Login / Signup ]
    │        │
    │        ▼
    └─► [ Student Dashboard ] ◄──────────────┐
             │                               │
             ├─► [ Events Listing ]          │
             │        │                      │
             │        ▼                      │
             │   [ Event Detail ] ───► [ Register ]
             │                               │
             ├─► [ My Registrations ] ───────┤
             │        │                      │
             │        ▼                      │
             │   [ Cancel Reg ]              │
             │                               │
             └─► [ Association Members ] ────┘
```

## Admin Journey

```
[ Admin Login ]
    │
    ▼
[ Admin Dashboard ]
    │
    ├─► [ Manage Events ] ───► [ Add / Edit / Delete Event ]
    ├─► [ Manage Registrations ] ───► [ Attendance check / CSV Export ]
    ├─► [ Student Directory ] ───► [ View profile details ]
    └─► [ App Settings ] ───► [ Edit toggles & limits ]
```
