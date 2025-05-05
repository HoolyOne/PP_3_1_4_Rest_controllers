package ru.kata.spring.boot_security.demo.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_security.demo.model.Role;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.service.RoleService;
import ru.kata.spring.boot_security.demo.service.UserService;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Controller
@RequestMapping("users")
public class UserController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final RoleService roleService;

    public UserController(UserService userService, PasswordEncoder passwordEncoder, RoleService roleService) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.roleService = roleService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/add")
    public String addUser(@RequestParam String name,
                          @RequestParam String surname,
                          @RequestParam Integer age,
                          @RequestParam String email,
                          @RequestParam String password,
                          @RequestParam List<Long> roles) {
        User user = new User();
        user.setName(name);
        user.setSurname(surname);
        user.setAge(age);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        Set<Role> userRoles = new HashSet<>(roleService.findAllById(roles));
        user.setRoles(userRoles);
        userService.addUser(user);
        return "redirect:/admin";
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/edit")
    public String updateUser(@RequestParam Long id,
                             @RequestParam String name,
                             @RequestParam String surname,
                             @RequestParam Integer age,
                             @RequestParam String email,
                             @RequestParam(required = false) String password,
                             @RequestParam List<Long> roles) {
        User user = userService.getUserById(id);
        if (user != null) {
            user.setName(name);
            user.setSurname(surname);
            user.setAge(age);
            user.setEmail(email);
            if (password != null && !password.isBlank()) {
                user.setPassword(passwordEncoder.encode(password));
            }
            Set<Role> userRoles = new HashSet<>(roleService.findAllById(roles));
            user.setRoles(userRoles);
            userService.updateUser(user);
        }
        return "redirect:/admin";
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/delete")
    public String deleteUser(@RequestParam Long id) {
        userService.removeUser(id);
        return "redirect:/admin";
    }
}
