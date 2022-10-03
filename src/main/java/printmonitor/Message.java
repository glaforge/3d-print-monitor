package printmonitor;

public record Message(String type, String id, String description) {
    public Message(String type, String id, String description) {
        this.type = type;
        this.id = id;
        this.description = description;
    }

    public Message(String type, String id) {
        this(type, id, null);
    }

    public Message(String type) {
        this(type, null, null);
    }
}
