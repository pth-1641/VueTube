import { defineStore } from 'pinia';
import { supabase } from '../supabase';

const initialState = {
  user: null,
  subscribedChannels: [],
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
    async signIn() {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
    },
    async signOut() {
      await supabase.auth.signOut();
      this.user = null;
      this.subscribedChannels = [];
      return null;
    },
    async subscribeChannel({ channelId, uid }) {
      if (!this.user) {
        await this.signIn();
        return;
      }
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
        .eq('user_id', this.user?.id);
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
