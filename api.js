// api.js

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
  reducerPath: 'api',
  refetchOnMountOrArgChange: true,
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://market.qorgau-city.kz/api/',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('Authorization', `Token ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ['PostList','PostListMap', 'CategoriesList','Favourites'],
  endpoints: (builder) => ({
    getPostList: builder.query({
      query: ({ page, limit }) => {
        console.log(`Querying with page: ${page}, limit: ${limit}`);
        return `posts/?page=${page}&page_size=${limit}`;
      },
      keepUnusedDataFor: 120,
      providesTags: ['PostList'],
    }),
    getPostListCity: builder.query({
      query: ({ page, limit, city }) => {
        return `posts_city/?page=${page}&page_size=${limit}&city=${encodeURIComponent(city)}`;
      },
      providesTags: ['PostList'],
    }),    
    getPostListMap: builder.query({
      query: () => 'posts_map/',
      providesTags: ['PostListMap'],
      keepUnusedDataFor: 400,
    }),
    getPostById: builder.query({
      query: (id) => `posts/${id}/`,
      keepUnusedDataFor: 0,
    }),
    getCategoriesList: builder.query({
      query: () => `categories/`,
      providesTags: ['CategoriesList'],
    }),
    getSubCategoriesList: builder.query({
      query: (id) => `categories/${id}/subcategories/`,
      providesTags: ['CategoriesList'],
    }),
    searchPosts: builder.query({
      query: (searchQuery) => `search_posts/?q=${searchQuery}`,
      providesTags: ['PostList'],
      keepUnusedDataFor: 0,
    }),
    getPostsBySubCategory: builder.query({
      // arg может быть числом/строкой (старый вызов),
      // или объектом { sub_category_id, city, page, limit } (новый вызов)
      query: (arg) => {
        if (typeof arg === 'object' && arg !== null) {
          const { sub_category_id, city, page, limit } = arg || {};
          const params = {};
          if (city)  params.city  = city;
          if (page)  params.page  = page;
          if (limit) params.limit = limit;
          return { url: `posts/subcategory/${sub_category_id}/`, params };
        }
        // старый вариант: только id, без параметров
        return `posts/subcategory/${arg}/`;
      },
      providesTags: ['PostList'],
      keepUnusedDataFor: 0,
    }),
    
    getPostsByGlobalCategory: builder.query({
      query: (arg) => {
        if (typeof arg === 'object' && arg !== null) {
          const { global_category, city, page, limit } = arg || {};
          const params = {};
          if (city)  params.city  = city;
          if (page)  params.page  = page;
          if (limit) params.limit = limit;
          return {
            url: `posts/global_category/${encodeURIComponent(global_category)}/`,
            params,
          };
        }
        // старый вариант: только строка категории
        return `posts/global_category/${encodeURIComponent(arg)}/`;
      },
      providesTags: ['PostList'],
      keepUnusedDataFor: 0,
    }),
    searchPostsByCity: builder.query({
      query: ({ q, city }) => ({
        url: 'search_posts/',
        params: { q, city },
      }),
      providesTags: ['PostList'],
      keepUnusedDataFor: 0,
    }),
    getActivePosts: builder.query({
      query: () => 'active_posts/',
      providesTags: ['PostList'],
      keepUnusedDataFor: 100,
    }),
    getAdminPosts: builder.query({
      query: () => 'admin_posts/',
      providesTags: ['PostList'],
      keepUnusedDataFor: 0,
    }),
    getNotActivePosts: builder.query({
      query: () => 'not_active_posts/',
      providesTags: ['PostList'],
      keepUnusedDataFor: 0,
    }),
    getDeletedPosts: builder.query({
      query: () => 'deleted_posts/',
      providesTags: ['PostList'],
      keepUnusedDataFor: 0,
    }),
    getNotPaidPosts: builder.query({
      query: () => 'paid_posts/',
      providesTags: ['PostList'],
      keepUnusedDataFor: 0,
    }),
    getPostsByCategory: builder.query({
      query: ({category_id,page,limit}) => `posts/category/${category_id}?page=${page}&page_size=${limit}`,
      providesTags: (result, error, categoryId) => [
        { type: 'PostList', id: categoryId },
      ],
      keepUnusedDataFor: 0,
    }),
    getPostsByCategoryAndCity:builder.query({
      query: ({category_id,page,limit,city}) => `posts/category-city/${category_id}?page=${page}&page_size=${limit}&city=${city}`,
      providesTags: (result, error, categoryId) => [
        { type: 'PostList', id: categoryId },
      ],
      keepUnusedDataFor: 0,
    }),

    listFavourites: builder.query({
      query: () => 'favourites/',
      providesTags: ['Favourites'],
      keepUnusedDataFor: 0,
    }),

    // 

    getUserByUsername: builder.query({
      query: (username) => `user/${username}/`,
      keepUnusedDataFor: 0,
    }),
    getPostsByUser: builder.query({
      query: (username) => `posts/user/${username}/`,
      keepUnusedDataFor: 0,
    }),
    
    // POST Queries

    deactivatePost: builder.mutation({
      query: (postId) => ({
        url: `posts/${postId}/deactivate/`,
        method: 'PATCH',
      }),
    }),

    activatePost: builder.mutation({
      query: (postId) => ({
        url: `posts/${postId}/activate/`,
        method: 'PATCH',
      }),
    }),
    
    approvePost: builder.mutation({
      query: (postId) => ({
        url: `posts/${postId}/approve/`,
        method: 'PATCH',
      }),
    }),
    
    deletePost: builder.mutation({
      query: (postId) => ({
        url: `posts/${postId}/delete/`,
        method: 'PATCH',
      }),
    }),

    payPost: builder.mutation({
      query: (postId) => ({
        url: `posts/${postId}/pay/`,
        method: 'PATCH',
      }),
    }),
    updateUserProfile: builder.mutation({
      query: (userData) => ({
        url: 'update-profile/',
        method: 'PATCH',  
        body: userData,  
      }),
    }),
    addToFavourites: builder.mutation({
      query: (postId) => ({
        url: `favourites/add/${postId}/`,
        method: 'POST',
      }),
      invalidatesTags: ['Favourites'],
    }),

    removeFromFavourites: builder.mutation({
      query: (postId) => ({
        url: `favourites/remove/${postId}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Favourites'],
    }),
  }),
});

export const {
  useGetPostListQuery,
  useGetPostListCityQuery,
  useGetPostListMapQuery,
  useGetPostByIdQuery,
  useGetCategoriesListQuery,
  useGetSubCategoriesListQuery,
  useGetPostsByCategoryAndCityQuery,
  useSearchPostsQuery,
  useSearchPostsByCityQuery,
  useGetActivePostsQuery,
  useGetAdminPostsQuery,
  useGetNotActivePostsQuery,
  useGetDeletedPostsQuery,
  useGetNotPaidPostsQuery,
  useGetPostsByCategoryQuery,
  useListFavouritesQuery,

  useGetPostsBySubCategoryQuery,
  useGetPostsByGlobalCategoryQuery,

  useGetPostsByUserQuery,
  useGetUserByUsernameQuery,

  // POST

  useAddToFavouritesMutation,
  useRemoveFromFavouritesMutation,

  useDeactivatePostMutation,
  useActivatePostMutation,
  useApprovePostMutation,
  useDeletePostMutation,
  usePayPostMutation,
  useUpdateUserProfileMutation,
} = api;
