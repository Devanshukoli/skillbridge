import React, { useState } from 'react';
import { Track, Module, Lesson, Project } from '../types';
import { Layers, Plus, Trash2, Edit, Save, X, BookOpen, Code, Folder } from 'lucide-react';

interface Props {
  curriculum: any;
  onRefreshCurriculum: () => void;
}

export default function AdminTracksCMSView({ curriculum, onRefreshCurriculum }: Props) {
  const [activeItem, setActiveItem] = useState<{type: 'track' | 'module' | 'lesson' | 'project', id?: string, parentId?: string} | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const handleCreateNew = (type: 'track' | 'module' | 'lesson' | 'project', parentId?: string) => {
    setActiveItem({ type, parentId });
    if (type === 'track') setFormData({ id: 'track-' + Date.now(), name: '', description: '', icon: 'BookOpen' });
    if (type === 'module') setFormData({ id: 'mod-' + Date.now(), trackId: parentId, title: '', order: 0 });
    if (type === 'lesson') setFormData({ id: 'les-' + Date.now(), moduleId: parentId, title: '', order: 0, estimatedMinutes: 10, content: '' });
    if (type === 'project') setFormData({ id: 'proj-' + Date.now(), trackId: curriculum.modules.find((m:any) => m.id === parentId)?.trackId, moduleId: parentId, type: 'practice', title: '', description: '', requirements: [], rubric: [], rewardPoints: 100, rewardMoney: 0 });
  };

  const handleEdit = (type: 'track' | 'module' | 'lesson' | 'project', item: any) => {
    setActiveItem({ type, id: item.id });
    setFormData(item);
  };

  const handleSave = async () => {
    if (!activeItem) return;
    setLoading(true);
    try {
      const isNew = !activeItem.id;
      const method = isNew ? 'POST' : 'PUT';
      const endpoint = `/api/admin/${activeItem.type}s${isNew ? '' : `/${formData.id}`}`;
      
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        onRefreshCurriculum();
        setActiveItem(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    try {
      await fetch(`/api/admin/${type}s/${id}`, { method: 'DELETE' });
      onRefreshCurriculum();
      if (activeItem?.id === id) setActiveItem(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-fade-in text-slate-800 h-[calc(100vh-8rem)]">
      {/* Left Pane: Hierarchy */}
      <div className="w-full lg:w-1/3 bg-white border border-slate-200 rounded-3xl p-4 flex flex-col shadow-sm">
        <div className="flex justify-between items-center mb-4 px-2">
          <h2 className="font-extrabold text-lg flex items-center gap-2"><Layers className="text-purple-500 w-5 h-5"/> Content Structure</h2>
          <button onClick={() => handleCreateNew('track')} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors cursor-pointer"><Plus className="w-5 h-5"/></button>
        </div>
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {curriculum.tracks.map((track: Track) => (
            <div key={track.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
              <div className="flex justify-between items-center p-3 bg-white border-b border-slate-200">
                <span className="font-bold text-sm">{track.name}</span>
                <div className="flex gap-1">
                  <button onClick={() => handleCreateNew('module', track.id)} className="text-slate-400 hover:text-blue-600 cursor-pointer" title="Add Module"><Plus className="w-4 h-4"/></button>
                  <button onClick={() => handleEdit('track', track)} className="text-slate-400 hover:text-blue-600 cursor-pointer"><Edit className="w-4 h-4"/></button>
                  <button onClick={() => handleDelete('track', track.id)} className="text-slate-400 hover:text-rose-600 cursor-pointer"><Trash2 className="w-4 h-4"/></button>
                </div>
              </div>
              <div className="p-2 space-y-2">
                {curriculum.modules.filter((m: Module) => m.trackId === track.id).map((mod: Module) => (
                  <div key={mod.id} className="ml-2 border-l-2 border-slate-200 pl-2">
                    <div className="flex justify-between items-center p-2 hover:bg-slate-100 rounded-lg group">
                      <span className="text-xs font-semibold flex items-center gap-1.5"><Folder className="w-3.5 h-3.5 text-blue-500"/> {mod.title}</span>
                      <div className="hidden group-hover:flex gap-1">
                        <button onClick={() => handleCreateNew('lesson', mod.id)} className="text-slate-400 hover:text-emerald-600 cursor-pointer" title="Add Lesson"><BookOpen className="w-3.5 h-3.5"/></button>
                        <button onClick={() => handleCreateNew('project', mod.id)} className="text-slate-400 hover:text-purple-600 cursor-pointer" title="Add Project"><Code className="w-3.5 h-3.5"/></button>
                        <button onClick={() => handleEdit('module', mod)} className="text-slate-400 hover:text-blue-600 cursor-pointer"><Edit className="w-3.5 h-3.5"/></button>
                        <button onClick={() => handleDelete('module', mod.id)} className="text-slate-400 hover:text-rose-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5"/></button>
                      </div>
                    </div>
                    <div className="ml-4 space-y-1 mt-1">
                      {curriculum.lessons.filter((l: Lesson) => l.moduleId === mod.id).map((les: Lesson) => (
                        <div key={les.id} className="flex justify-between items-center p-1.5 hover:bg-white rounded group cursor-pointer" onClick={() => handleEdit('lesson', les)}>
                          <span className="text-[11px] flex items-center gap-1.5 text-slate-600"><BookOpen className="w-3 h-3 text-slate-400"/> {les.title}</span>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete('lesson', les.id); }} className="hidden group-hover:block text-slate-400 hover:text-rose-600 cursor-pointer"><Trash2 className="w-3 h-3"/></button>
                        </div>
                      ))}
                      {curriculum.projects.filter((p: Project) => p.moduleId === mod.id).map((proj: Project) => (
                        <div key={proj.id} className="flex justify-between items-center p-1.5 hover:bg-white rounded group cursor-pointer" onClick={() => handleEdit('project', proj)}>
                          <span className="text-[11px] flex items-center gap-1.5 text-purple-700 font-semibold"><Code className="w-3 h-3 text-purple-400"/> {proj.title}</span>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete('project', proj.id); }} className="hidden group-hover:block text-slate-400 hover:text-rose-600"><Trash2 className="w-3 h-3"/></button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Pane: Editor */}
      <div className="w-full lg:w-2/3 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-y-auto">
        {activeItem ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold capitalize">
                {activeItem.id ? 'Edit' : 'Create'} {activeItem.type}
              </h3>
              <button onClick={() => setActiveItem(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="space-y-4">
              {/* Common Fields */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">ID (Slug)</label>
                <input type="text" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} disabled={!!activeItem.id} className="w-full px-3 py-2 border rounded-xl text-sm bg-slate-50 text-slate-500" />
              </div>
              
              {activeItem.type === 'track' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Name</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm" rows={3} />
                  </div>
                </>
              )}

              {['module', 'lesson'].includes(activeItem.type) && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Title</label>
                    <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Order Index</label>
                    <input type="number" value={formData.order} onChange={e => setFormData({...formData, order: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-xl text-sm no-scroll" />
                  </div>
                </>
              )}

              {activeItem.type === 'lesson' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Estimated Minutes</label>
                    <input type="number" value={formData.estimatedMinutes} onChange={e => setFormData({...formData, estimatedMinutes: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Markdown Content</label>
                    <textarea value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm font-mono h-64" />
                  </div>
                </>
              )}

              {activeItem.type === 'project' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Title</label>
                    <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Type</label>
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm">
                      <option value="practice">Practice</option>
                      <option value="capstone">Capstone</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Description (Markdown)</label>
                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm h-24" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Reward Points (XP)</label>
                      <input type="number" value={formData.rewardPoints} onChange={e => setFormData({...formData, rewardPoints: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-xl text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Reward Money ($)</label>
                      <input type="number" value={formData.rewardMoney} onChange={e => setFormData({...formData, rewardMoney: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-xl text-sm" />
                    </div>
                  </div>
                </>
              )}

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4"/>
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
            <Layers className="w-12 h-12 opacity-20"/>
            <p className="text-sm">Select an item from the left pane to edit, or create a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
