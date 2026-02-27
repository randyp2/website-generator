package com.webgen.webgen_backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "profiles", schema = "public")
@NoArgsConstructor
@Getter
@Setter
public class Profile {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "email")
    private String email;

    @Column(name = "avatar_url")
    private String avatarUrl;
}
