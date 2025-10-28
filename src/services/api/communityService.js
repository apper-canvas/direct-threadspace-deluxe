import { getApperClient } from "@/services/apperClient";
import { toast } from "react-toastify";
import React from "react";
import Error from "@/components/ui/Error";

export class CommunityService {
  static async search(query) {
    try {
      if (!query || !query.trim()) {
        return [];
      }

      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      const searchTerm = query.toLowerCase().trim();
      
      const response = await apperClient.fetchRecords('community_c', {
        fields: [
          { field: { Name: 'Name' } },
          { field: { Name: 'name_c' } },
          { field: { Name: 'description_c' } },
          { field: { Name: 'icon_c' } },
          { field: { Name: 'member_count_c' } },
          { field: { Name: 'color_c' } }
        ]
      });

      if (!response.success) {
        return [];
      }

      const results = [];
      for (const community of (response.data || [])) {
        const name = community.name_c || '';
        const description = community.description_c || '';

        const nameMatch = name.toLowerCase().includes(searchTerm);
        const descMatch = description.toLowerCase().includes(searchTerm);

        if (nameMatch || descMatch) {
          let snippet = '';
          
          if (descMatch) {
            const index = description.toLowerCase().indexOf(searchTerm);
            const start = Math.max(0, index - 40);
            const end = Math.min(description.length, index + searchTerm.length + 40);
            snippet = description.substring(start, end);
          }

          results.push({
            community: this.transformCommunity(community),
            snippet: snippet.trim()
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error searching communities:', error?.response?.data?.message || error);
      return [];
    }
  }

  static transformCommunity(community) {
    return {
      Id: community.Id,
      id: `community_${community.Id}`,
      name: community.name_c || '',
      description: community.description_c || '',
      icon: community.icon_c || 'Users',
      memberCount: community.member_count_c || 0,
      color: community.color_c || '#FF4500'
    };
  }

  static async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      const response = await apperClient.fetchRecords('community_c', {
        fields: [
          { field: { Name: 'Name' } },
          { field: { Name: 'name_c' } },
          { field: { Name: 'description_c' } },
          { field: { Name: 'icon_c' } },
          { field: { Name: 'member_count_c' } },
          { field: { Name: 'color_c' } }
        ],
        orderBy: [{ fieldName: 'member_count_c', sorttype: 'DESC' }]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return (response.data || []).map(community => this.transformCommunity(community));
    } catch (error) {
      console.error('Error fetching communities:', error?.response?.data?.message || error);
      return [];
    }
  }

  static async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      const response = await apperClient.getRecordById('community_c', parseInt(id), {
        fields: [
          { field: { Name: 'Name' } },
          { field: { Name: 'name_c' } },
          { field: { Name: 'description_c' } },
          { field: { Name: 'icon_c' } },
          { field: { Name: 'member_count_c' } },
          { field: { Name: 'color_c' } }
        ]
      });

      if (!response.success || !response.data) {
        return null;
      }

      return this.transformCommunity(response.data);
    } catch (error) {
      console.error('Error fetching community by ID:', error?.response?.data?.message || error);
      return null;
    }
  }

  static async getByName(name) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      const response = await apperClient.fetchRecords('community_c', {
        fields: [
          { field: { Name: 'Name' } },
          { field: { Name: 'name_c' } },
          { field: { Name: 'description_c' } },
          { field: { Name: 'icon_c' } },
          { field: { Name: 'member_count_c' } },
          { field: { Name: 'color_c' } }
        ],
        where: [{
          FieldName: 'name_c',
          Operator: 'EqualTo',
          Values: [name]
        }],
        pagingInfo: { limit: 1, offset: 0 }
      });

      if (!response.success || !response.data || response.data.length === 0) {
        return null;
      }

      return this.transformCommunity(response.data[0]);
    } catch (error) {
      console.error('Error fetching community by name:', error?.response?.data?.message || error);
      return null;
    }
  }

  static async create(communityData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      const payload = {
        records: [{
          Name: communityData.name,
          name_c: communityData.name,
          description_c: communityData.description,
          icon_c: communityData.icon || 'Users',
          member_count_c: 1,
          color_c: communityData.color || '#FF4500'
        }]
      };

      const response = await apperClient.createRecord('community_c', payload);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error('Failed to create community');
      }

      if (response.results && response.results.length > 0) {
        const created = response.results[0];
        if (created.success) {
          return this.transformCommunity(created.data);
        } else {
          throw new Error(created.message || 'Failed to create community');
        }
      }

      throw new Error('Failed to create community');
    } catch (error) {
      console.error('Error creating community:', error?.response?.data?.message || error);
      throw error;
    }
  }

  static async update(id, updateData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      const payload = {
        records: [{
          Id: parseInt(id),
          ...(updateData.name && { name_c: updateData.name }),
          ...(updateData.description && { description_c: updateData.description }),
          ...(updateData.icon && { icon_c: updateData.icon }),
          ...(updateData.memberCount !== undefined && { member_count_c: updateData.memberCount }),
          ...(updateData.color && { color_c: updateData.color })
        }]
      };

      const response = await apperClient.updateRecord('community_c', payload);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results && response.results.length > 0) {
        const updated = response.results[0];
        if (updated.success) {
          return this.transformCommunity(updated.data);
        }
      }

      return null;
    } catch (error) {
      console.error('Error updating community:', error?.response?.data?.message || error);
      return null;
    }
  }

  static async delete(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      const response = await apperClient.deleteRecord('community_c', {
        RecordIds: [parseInt(id)]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting community:', error?.response?.data?.message || error);
      return false;
    }
  }

  static getJoinedCommunities() {
    const joined = localStorage.getItem('joinedCommunities');
    return joined ? JSON.parse(joined) : [];
  }

  static joinCommunity(communityId) {
    const joined = this.getJoinedCommunities();
    if (!joined.includes(communityId)) {
      joined.push(communityId);
      localStorage.setItem('joinedCommunities', JSON.stringify(joined));
    }
  }

  static leaveCommunity(communityId) {
    const joined = this.getJoinedCommunities();
    const filtered = joined.filter(id => id !== communityId);
    localStorage.setItem('joinedCommunities', JSON.stringify(filtered));
  }

  static isJoined(communityId) {
    const joined = this.getJoinedCommunities();
return joined.includes(communityId);
  }
}