import React, { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View, SafeAreaView, TextInput } from 'react-native';
import { Link } from 'expo-router';
import { RelativePathString, useRouter } from 'expo-router';
import CustomButton from '@/components/Button';
import { Modal } from 'react-native';

interface Post {
  _id: string;
  title: string;
  content: string;
}

const Community: React.FC = () => {
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

    useEffect(() => {
        fetchPosts();
    }, []);

    useEffect(() => {
        filterPosts();
    }, [searchQuery, posts]);

    const fetchPosts = async () => {
        try {
            const response = await fetch('http://192.168.0.140:3000/api/community/all', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            setPosts(data);
        } catch (error) {
            alert('An error occurred. Please try again later.');
        }
    };

    const filterPosts = () => {
        const filtered = posts.filter(post =>
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.content.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredPosts(filtered);
    };

    const renderPost = ({ item }: { item: Post }) => (
        <TouchableOpacity
            key={item._id}
            onPress={() => {
                router.push(`/community/post/${item?._id}`);
            }}
            className="rounded-xl p-5 mb-4 shadow-md" 
            
        >
            <Text className="text-lg font-bold text-gray-900">{item.title}</Text>
            <Text className="text-sm text-gray-600 mt-2" numberOfLines={2}>
                {item.content}
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1">
            <View className="p-4">
                <Text className="text-2xl font-bold text-gray-900 mb-6">Community</Text>
                <View className="mb-7">
                    <Text className="text-gray-500 text-xl">
                        Interact & help others in our vast community of gardeners.
                    </Text>
                </View>
                <TextInput
                    className="border p-2 mb-4 rounded"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <FlatList
                    data={filteredPosts}
                    keyExtractor={(item) => item._id || item.title}
                    renderItem={renderPost}
                    ListEmptyComponent={
                        <Text className="text-center text-gray-500">
                            No posts available. Be the first to contribute!
                        </Text>
                    }
                    contentContainerStyle={filteredPosts.length === 0 ? { flex: 1, justifyContent: 'center' } : undefined}
                />
                <CustomButton
                    title="Create Post"
                    bgVariant="plant"
                    className="mt-4"
                    onPress={() => router.push('/community/create')}
                />
            </View>
        </SafeAreaView>
    );
};

export default Community;
