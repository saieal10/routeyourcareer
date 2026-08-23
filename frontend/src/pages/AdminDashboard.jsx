
              'started';

            return (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    ['Application ID', item.application_id || '—'],
                    ['Stage', applicationStageLabel(stage)],
                    ['Track', item.stream || profile.stream || '—'],
                    ['Created', fmt(item.created_at)]
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-2xl bg-white border border-ink/10 p-4"
                    >
                      <div className="text-[9px] mono uppercase tracking-widest text-ink/40">
                        {label}
                      </div>

                      <div className="text-[12px] font-semibold mt-1 break-words">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid lg:grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-white border border-ink/10 p-5">
                    <div className="text-[10px] mono uppercase tracking-widest text-coral">
                      Student
                    </div>

                    <div className="mt-4 space-y-3 text-[12px]">
                      <div>
                        <span className="text-ink/45">Name:</span>{' '}
                        <strong>{item.name || '—'}</strong>
                      </div>

                      <div>
                        <span className="text-ink/45">Phone:</span>{' '}
                        <strong>{item.phone || '—'}</strong>
                      </div>
