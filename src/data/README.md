# data

The repository-pattern seam described in `docs/13_Technical_Architecture.md`
§4 and `docs/16_Data_Model_Plan.md` §6: base repository interfaces, the
repository factory, and (once a data-source config exists) the
`VITE_DATA_SOURCE` resolution logic that will later switch from mock
implementations to Supabase-backed ones with no component changes.

Intentionally empty in this milestone — no data layer or business logic has
been built yet.
