package cc.nobrain.dev.userserver.domain.base.service

import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.stereotype.Service

@Service
class EmailService(
    private val emailSender: JavaMailSender
) {
    fun sendSimpleMessage(to: String?, subject: String?, text: String?) {
        val message = SimpleMailMessage();
        message.from = "nobrain@nobrain.cc";
        message.setTo(to);
        message.subject = subject;
        message.text = text;
        emailSender.send(message);
    }
}