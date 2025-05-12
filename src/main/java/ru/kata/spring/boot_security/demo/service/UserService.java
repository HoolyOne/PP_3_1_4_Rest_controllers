package ru.kata.spring.boot_security.demo.service;

import ru.kata.spring.boot_security.demo.model.User;

import java.util.List;

public interface UserService {
    void addUser(User user);

    void updateUser(User user);

    List<User> listUsers();

    List<User> listUsersWithRoles();

    User getUserById(Long id);

    User getUserByIdWithRoles(Long id);

    User getUserByEmailWithRoles(String email);

    void removeUser(Long id);
}
