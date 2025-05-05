package ru.kata.spring.boot_security.demo.configs;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import ru.kata.spring.boot_security.demo.model.Role;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.repository.RoleRepository;
import ru.kata.spring.boot_security.demo.repository.UserRepository;

import java.util.Set;

@Configuration
public class DataInitialiser {

    @Bean
    public CommandLineRunner loadData(RoleRepository roleRepository,
                                      UserRepository userRepository,
                                      PasswordEncoder passwordEncoder) {
        return (args) -> {
            if (roleRepository.findByName("ROLE_ADMIN") == null) {
                roleRepository.save(new Role("ROLE_ADMIN"));
            }
            if (roleRepository.findByName("ROLE_USER") == null) {
                roleRepository.save(new Role("ROLE_USER"));
            }
            Role adminRole = roleRepository.findByName("ROLE_ADMIN");
            Role userRole = roleRepository.findByName("ROLE_USER");

            if (userRepository.findByEmail("admin@mail.ru").isEmpty()) {
                User admin = new User();
                admin.setEmail("admin@mail.ru");
                admin.setPassword(passwordEncoder.encode("admin"));
                admin.setName("Александр");
                admin.setSurname("Мухин");
                admin.setAge(29);
                admin.setRoles(Set.of(adminRole, userRole));
                userRepository.save(admin);
            }
            if (userRepository.findByEmail("user@mail.ru").isEmpty()) {
                User user = new User();
                user.setEmail("user@mail.ru");
                user.setPassword(passwordEncoder.encode("user"));
                user.setName("Иван");
                user.setSurname("Иванов");
                user.setAge(30);
                user.setRoles(Set.of(userRole));
                userRepository.save(user);
            }
        };
    }
}
