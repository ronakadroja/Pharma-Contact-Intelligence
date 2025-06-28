import { useState, useEffect, useCallback, useRef } from 'react';

interface UseInfiniteScrollOptions {
    /** Threshold in pixels from bottom to trigger loading */
    threshold?: number;
    /** Whether infinite scroll is enabled */
    enabled?: boolean;
    /** Whether currently loading */
    isLoading?: boolean;
    /** Whether there are more items to load */
    hasMore?: boolean;
}

interface UseInfiniteScrollReturn {
    /** Whether currently loading more items */
    isLoadingMore: boolean;
    /** Function to trigger loading more items */
    loadMore: () => void;
    /** Ref to attach to the container element */
    containerRef: React.RefObject<HTMLDivElement>;
    /** Function to reset the infinite scroll state */
    reset: () => void;
}

const useInfiniteScroll = (
    onLoadMore: () => void | Promise<void>,
    options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn => {
    const {
        threshold = 200,
        enabled = true,
        isLoading = false,
        hasMore = true
    } = options;

    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const loadingRef = useRef(false);

    const loadMore = useCallback(() => {
        if (loadingRef.current || !hasMore || isLoading) {
            return;
        }

        loadingRef.current = true;
        setIsLoadingMore(true);

        const executeLoad = async () => {
            try {
                await onLoadMore();
            } catch (error) {
                console.error('Error loading more items:', error);
            } finally {
                setIsLoadingMore(false);
                loadingRef.current = false;
            }
        };

        executeLoad();
    }, [onLoadMore, hasMore, isLoading]);

    const reset = useCallback(() => {
        setIsLoadingMore(false);
        loadingRef.current = false;
    }, []);

    useEffect(() => {
        if (!enabled || !hasMore || isLoading || isLoadingMore) {
            return;
        }

        // Always use window scroll for this implementation
        const handleWindowScroll = () => {
            if (loadingRef.current) {
                return;
            }

            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = window.innerHeight;
            const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
            const isNearBottom = distanceFromBottom <= threshold;

            if (isNearBottom) {
                loadMore();
            }
        };

        window.addEventListener('scroll', handleWindowScroll, { passive: true });

        // Also trigger an initial check in case we're already at the bottom
        setTimeout(() => {
            handleWindowScroll();
        }, 100);

        return () => {
            window.removeEventListener('scroll', handleWindowScroll);
        };
    }, [enabled, hasMore, isLoading, isLoadingMore, threshold, loadMore]);

    return {
        isLoadingMore,
        loadMore,
        containerRef,
        reset
    };
};

export default useInfiniteScroll;
