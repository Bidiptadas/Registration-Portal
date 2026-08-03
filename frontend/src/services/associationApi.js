/**
 * Association API Service (Mock Mode).
 */
import { getFromStore, saveToStore } from './mockDb';

export const associationApi = {
  getMembers: async () => {
    const members = getFromStore('tp_members') || [];
    return { data: { success: true, data: members } };
  },

  createMember: async (data) => {
    const members = getFromStore('tp_members') || [];
    const newMember = {
      ...data,
      memberId: `mem-${Date.now()}`,
    };
    members.push(newMember);
    saveToStore('tp_members', members);
    return { data: { success: true, data: newMember } };
  },

  updateMember: async (id, data) => {
    const members = getFromStore('tp_members') || [];
    const index = members.findIndex((m) => m.memberId === id);
    if (index !== -1) {
      members[index] = { ...members[index], ...data };
      saveToStore('tp_members', members);
    }
    return { data: { success: true, data: members[index] } };
  },

  deleteMember: async (id) => {
    const members = getFromStore('tp_members') || [];
    const updated = members.filter((m) => m.memberId !== id);
    saveToStore('tp_members', updated);
    return { data: { success: true } };
  },

  // Event Heads
  getEventHeads: async () => {
    const heads = getFromStore('tp_heads') || [];
    return { data: { success: true, data: heads } };
  },

  createEventHead: async (data) => {
    const heads = getFromStore('tp_heads') || [];
    const newHead = {
      ...data,
      headId: `head-${Date.now()}`,
    };
    heads.push(newHead);
    saveToStore('tp_heads', heads);
    return { data: { success: true, data: newHead } };
  },

  updateEventHead: async (id, data) => {
    const heads = getFromStore('tp_heads') || [];
    const index = heads.findIndex((h) => h.headId === id);
    if (index !== -1) {
      heads[index] = { ...heads[index], ...data };
      saveToStore('tp_heads', heads);
    }
    return { data: { success: true, data: heads[index] } };
  },

  deleteEventHead: async (id) => {
    const heads = getFromStore('tp_heads') || [];
    const updated = heads.filter((h) => h.headId !== id);
    saveToStore('tp_heads', updated);
    return { data: { success: true } };
  },
};

export default associationApi;
