package ru.kata.spring.boot_security.demo.service;

import ru.kata.spring.boot_security.demo.model.User;

import java.util.List;

public interface UserService {
    void addUser(User user);

    void updateUser(User user);

    List<User> listUsers();

    User getUserById(Long id);

    void removeUser(Long id);
}
