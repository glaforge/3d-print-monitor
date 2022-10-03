package printmonitor;

import io.micronaut.core.async.publisher.Publishers;
import io.micronaut.websocket.WebSocketBroadcaster;
import io.micronaut.websocket.WebSocketSession;
import io.micronaut.websocket.annotation.OnClose;
import io.micronaut.websocket.annotation.OnMessage;
import io.micronaut.websocket.annotation.OnOpen;
import io.micronaut.websocket.annotation.ServerWebSocket;
import org.reactivestreams.Publisher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

@ServerWebSocket("/ice")
public class SignalingWebSocketController {
    private final WebSocketBroadcaster broadcaster;
    private final Map<String, WebSocketSession> allSessions = new HashMap<>();
    private WebSocketSession broadcasterSession = null;

    private static final Logger LOG = LoggerFactory.getLogger(SignalingWebSocketController.class);

    public SignalingWebSocketController(WebSocketBroadcaster broadcaster) {
        this.broadcaster = broadcaster;
    }

    @OnOpen
    public Publisher<Message> onOpen(WebSocketSession session) {
        System.out.println("on open (" + session.getId() + ")");
        allSessions.put(session.getId(), session);
        return broadcaster.broadcast(new Message("broadcaster"));
    }

    @OnMessage
    public Publisher<Message> onMessage(Message msg, WebSocketSession session) {
        System.out.println("on message (" + session.getId() + ") : " + msg);
        switch (msg.type()) {
            case "broadcaster" -> {
                System.out.println(" -> broadcaster");
                this.broadcasterSession = session;
                return broadcaster.broadcast(new Message("broadcaster", session.getId()));
            }
            case "watcher" -> {
                System.out.println(" -> watcher");
                if (broadcasterSession != null) {
                    return broadcasterSession.send(new Message("watcher", session.getId()));
                } else {
                    return Publishers.empty();
                }
            }
            case "offer" -> {
                System.out.println(" -> offer");
                return allSessions.get(msg.id()).send(new Message("offer", session.getId(), msg.description()));
            }
            case "answer" -> {
                System.out.println(" -> answer > desc: " + msg.description());
                return allSessions.get(msg.id()).send(new Message("answer", session.getId(), msg.description()));
            }
            case "candidate" -> {
                System.out.println(" -> candidate > desc: " + msg.description());
                return allSessions.get(msg.id()).send(new Message("candidate", session.getId(), msg.description()));
            }
            default -> {
                System.out.println(" -> unknown message " + msg);
                return Publishers.empty();
            }
        }
    }

    @OnClose
    public void onClose(WebSocketSession session) {
        System.out.println("on close (" + session.getId() + ")");
        allSessions.remove(session);
        if (session.equals(broadcasterSession)) {
            System.out.println(" -> broadcaster session closed");
            this.broadcasterSession = null;
        }
    }
}
