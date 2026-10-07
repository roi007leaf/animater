# Sound discovery warning

The runtime scanner treated its 600-folder limit as a generic folder-read failure. The installed GGG, PSFX and SoundFx Library trees contain 616 folders together. Before the fix, discovery stopped after 603 reads with no filesystem failures: 3,957 loose audio files were exposed, and the generic warning appeared. Each individual pack completed without a warning, confirming that combined traversal exceeded the budget.

After the fix, the same local FilePicker-response replay visits all 616 folders and exposes 4,050 loose audio files with no remaining folders, read failures or warning. Counts refer to local file discovery; registered Sequencer variants and curated audio are merged separately and are not additive.

The safety budget is now 10,000 unique folders, with exact batch budgeting and deduplicated scheduling. Deep paths no longer disappear silently at ten levels. Browsing remains restricted to enabled known sound-module roots through Foundry's FilePicker permissions. Genuine failures retain available media and report the failed path/reason; a reached scan limit has a separate warning.

Replay: `node tools/qa-sound-discovery.mjs ggg psfx soundfxlibrary`. The development tool reads installed folders and feeds the production scanner FilePicker-shaped results. This verifies local content traversal, not authenticated Foundry permissions.

Regressions cover libraries larger than 600 folders, exact safety limits, duplicate paths, unreadable-folder diagnostics, registered-only discovery, deep paths and successful refresh clearing an earlier warning.
