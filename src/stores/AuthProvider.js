import { defineStore } from 'pinia';
import { supabase } from '../supabase';

const initialState = {
  user: null,
  subscribedChannels: [],
  likedVideos: [],
};

export const useAuth = defineStore('auth-provider', {
  state: () => initialState,
  getters: {
    userId() {
      return this.user?.id;
    },
    userInfo() {
      return this.user;
    },
  },
  actions: {
    async getUser() {
      const { data } = await supabase.auth.getUser();
      return (this.user = data.user);
    },
    logOut() {
      return (this.user = null);
    },
    async subscribeChannel({ channelId, uid }) {
      return await supabase
        .from('channels')
        .insert({ channel_id: channelId, user_id: uid });
    },
    async unsubscribeChannel(id) {
      return await supabase.from('channels').delete().eq('id', id);
    },
    async getSubscribedChannels() {
      const { data } = await supabase
        .from('channels')
        .select()
        .eq('user_id', this.user.id);
      this.subscribedChannels = data;
      supabase
        .channel('channels')
        .on('postgres_changes', { event: '*', schema: 'public' }, (data) => {
          if (data.eventType === 'INSERT') {
            this.subscribedChannels.push(data.new);
            return;
          }
          if (data.eventType === 'DELETE') {
            const index = this.subscribedChannels.findIndex(
              (c) => c.id === data.old.id
            );
            this.subscribedChannels.splice(index, 1);
            return;
          }
        })
        .subscribe();
    },
  },
});
