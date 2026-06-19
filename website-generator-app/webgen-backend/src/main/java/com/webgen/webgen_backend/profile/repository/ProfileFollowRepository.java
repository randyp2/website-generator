package com.webgen.webgen_backend.profile.repository;

import com.webgen.webgen_backend.profile.entity.ProfileFollow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;

public interface ProfileFollowRepository extends JpaRepository<ProfileFollow, UUID> {

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = """
            insert into public.profile_follows (id, follower_profile_id, followed_profile_id)
            values (:id, :followerProfileId, :followedProfileId)
            on conflict (follower_profile_id, followed_profile_id) do nothing
            """, nativeQuery = true)
    int insertIgnore(UUID id, UUID followerProfileId, UUID followedProfileId);

    boolean existsByFollowerProfile_IdAndFollowedProfile_Id(
            UUID followerProfileId,
            UUID followedProfileId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            delete from ProfileFollow f
            where f.followerProfile.id = :followerProfileId
              and f.followedProfile.id = :followedProfileId
            """)
    int deleteByFollowerProfileIdAndFollowedProfileId(
            UUID followerProfileId,
            UUID followedProfileId);
}
